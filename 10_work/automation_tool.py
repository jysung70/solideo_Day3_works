#!/usr/bin/env python3
"""설정 기반 파일 백업·정리 자동화 도구."""
from __future__ import annotations

import argparse
import json
import logging
import shutil
import sys
from datetime import datetime, timedelta
from fnmatch import fnmatch
from hashlib import sha256
from pathlib import Path
from typing import Any, Dict, Iterable, List
from zipfile import ZIP_DEFLATED, ZipFile


def load_config(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def setup_logger(log_dir: Path) -> logging.Logger:
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / f"automation_{datetime.now():%Y%m%d}.log"
    logger = logging.getLogger("automation")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()

    formatter = logging.Formatter("%(asctime)s [%(levelname)s] %(message)s")

    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    return logger


def should_exclude(relative_path: Path, patterns: Iterable[str]) -> bool:
    path_str = str(relative_path).replace("\\", "/")
    return any(fnmatch(path_str, pattern) or fnmatch(relative_path.name, pattern) for pattern in patterns)


def backup_folders(root: Path, config: Dict[str, Any], logger: logging.Logger) -> None:
    rules = config.get("backup_rules", {})
    folders = rules.get("folders", [])
    exclude_patterns = rules.get("exclude_patterns", [])
    retention_days = rules.get("retention_days", 30)
    backup_root = root / "backups"
    backup_root.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    logger.info("백업 작업 시작 (대상: %s)", ", ".join(folders))

    for folder_name in folders:
        target_dir = root / folder_name
        if not target_dir.exists():
            logger.warning("백업 대상 폴더가 없습니다: %s", target_dir)
            continue
        zip_dir = backup_root / folder_name
        zip_dir.mkdir(parents=True, exist_ok=True)
        zip_path = zip_dir / f"{folder_name}_{timestamp}.zip"
        with ZipFile(zip_path, "w", compression=ZIP_DEFLATED) as archive:
            for file in target_dir.rglob("*"):
                if file.is_file():
                    rel_path = file.relative_to(root)
                    if should_exclude(rel_path, exclude_patterns):
                        logger.info("백업 제외: %s", rel_path)
                        continue
                    archive.write(file, arcname=rel_path.as_posix())
        logger.info("백업 생성: %s", zip_path)

        cleanup_old_backups(zip_dir, retention_days, logger)


def cleanup_old_backups(folder: Path, retention_days: int, logger: logging.Logger) -> None:
    if retention_days <= 0:
        return
    threshold = datetime.now() - timedelta(days=retention_days)
    for zip_file in folder.glob("*.zip"):
        modified = datetime.fromtimestamp(zip_file.stat().st_mtime)
        if modified < threshold:
            zip_file.unlink(missing_ok=True)
            logger.info("오래된 백업 삭제: %s", zip_file)


def move_file(source: Path, destination: Path, logger: logging.Logger) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(source), str(destination))
    logger.info("파일 이동: %s -> %s", source, destination)


def organize_files(root: Path, config: Dict[str, Any], logger: logging.Logger) -> None:
    rules = config.get("file_organization", {}).get("rules", [])
    if not rules:
        return
    logger.info("파일 정리 규칙 적용 (%d개)", len(rules))

    for rule in rules:
        pattern = rule.get("pattern")
        destination = rule.get("destination")
        if not pattern or not destination:
            logger.warning("유효하지 않은 정리 규칙: %s", rule)
            continue
        dest_root = root / destination
        older_than_days = rule.get("older_than_days")
        cutoff = None
        if isinstance(older_than_days, (int, float)):
            cutoff = datetime.now() - timedelta(days=older_than_days)
        create_year_folders = rule.get("create_year_folders", False)

        for file in root.rglob(pattern):
            if not file.is_file():
                continue
            if dest_root in file.parents:
                continue
            if cutoff:
                modified = datetime.fromtimestamp(file.stat().st_mtime)
                if modified > cutoff:
                    continue
            target_dir = dest_root
            if create_year_folders:
                year = datetime.fromtimestamp(file.stat().st_mtime).strftime("%Y")
                target_dir = dest_root / year
            destination_path = target_dir / file.name
            move_file(file, destination_path, logger)


def hash_file(path: Path) -> str:
    digest = sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(8192), b""):
            digest.update(chunk)
    return digest.hexdigest()


def cleanup_workspace(root: Path, config: Dict[str, Any], logger: logging.Logger) -> None:
    rules = config.get("cleanup", {})
    if not rules:
        return
    quarantine_root = root / "quarantine"
    duplicates_dir = quarantine_root / "duplicates"
    expired_dir = quarantine_root / "expired"
    duplicates_dir.mkdir(parents=True, exist_ok=True)
    expired_dir.mkdir(parents=True, exist_ok=True)

    if rules.get("remove_duplicates"):
        logger.info("중복 파일 정리 수행")
        seen: Dict[str, Path] = {}
        for file in root.rglob("*"):
            if file.is_file() and "backups" not in file.parts and "quarantine" not in file.parts:
                digest = hash_file(file)
                if digest in seen:
                    target = duplicates_dir / file.name
                    move_file(file, target, logger)
                else:
                    seen[digest] = file

    max_age = rules.get("max_file_age_days")
    if isinstance(max_age, (int, float)) and max_age > 0:
        cutoff = datetime.now() - timedelta(days=max_age)
        logger.info("오래된 파일 정리 (기준: %s 이전)", cutoff.date())
        for file in root.rglob("*"):
            if file.is_file() and "backups" not in file.parts and "quarantine" not in file.parts:
                modified = datetime.fromtimestamp(file.stat().st_mtime)
                if modified < cutoff:
                    target = expired_dir / file.relative_to(root)
                    move_file(file, target, logger)

    if rules.get("delete_empty_folders"):
        logger.info("빈 폴더 삭제")
        for folder in sorted((p for p in root.rglob("*") if p.is_dir()), reverse=True):
            if folder in (duplicates_dir, expired_dir):
                continue
            if not any(folder.iterdir()):
                folder.rmdir()
                logger.info("빈 폴더 삭제: %s", folder)


def run_automation(root: Path, config_path: Path) -> None:
    config = load_config(config_path)
    log_dir = root / "logs"
    logger = setup_logger(log_dir)
    logger.info("자동화 시작 - 루트: %s", root)

    backup_folders(root, config, logger)
    organize_files(root, config, logger)
    cleanup_workspace(root, config, logger)

    logger.info("자동화 완료")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="파일 백업 및 정리 자동화 도구")
    parser.add_argument("root", help="작업 대상 루트 폴더")
    parser.add_argument(
        "-c",
        "--config",
        default="automation_config.json",
        help="설정 파일 경로 (기본값: automation_config.json)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = Path(args.root).expanduser().resolve()
    config_path = Path(args.config).expanduser().resolve()
    if not root.exists():
        raise SystemExit(f"지정한 루트 폴더가 없습니다: {root}")
    if not config_path.exists():
        raise SystemExit(f"설정 파일을 찾을 수 없습니다: {config_path}")
    run_automation(root, config_path)


if __name__ == "__main__":
    main()
