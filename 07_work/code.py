def validate_korean_id(id_number):
    """한국 주민등록번호의 체크섬을 검증한다.

    Args:
        id_number (str): 하이픈 포함 여부와 관계없는 13자리 문자열.

    Returns:
        bool: 계산된 체크섬이 마지막 자리와 일치하면 True, 아니면 False.
    """
    id_number = id_number.replace('-', '')
    if len(id_number) != 13:
        return False
    
    multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]
    check_sum = 0
    
    for i in range(12):
        check_sum += int(id_number[i]) * multipliers[i]
    
    check_digit = (11 - (check_sum % 11)) % 10
    return check_digit == int(id_number[12])


def mask_sensitive_data(text, pattern_type):
    """문자열에서 전화번호, 이메일, 카드 정보를 찾아 마스킹한다.

    Args:
        text (str): 민감 정보가 포함될 수 있는 원본 문자열.
        pattern_type (str): 'phone'·'email'·'card' 중 하나의 마스킹 유형.

    Returns:
        str: 지원되는 유형이면 해당 부분을 가린 문자열, 아니면 원본 문자열.
    """
    import re
    
    patterns = {
        'phone': r'(\d{3})[-.]?(\d{4})[-.]?(\d{4})',
        'email': r'([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',
        'card': r'(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})[-\s]?(\d{4})'
    }
    
    if pattern_type not in patterns:
        return text
    
    pattern = patterns[pattern_type]
    
    if pattern_type == 'phone':
        return re.sub(pattern, r'\1-****-****', text)
    elif pattern_type == 'email':
        return re.sub(pattern, lambda m: m.group(1)[:3] + '***@' + m.group(2), text)
    elif pattern_type == 'card':
        return re.sub(pattern, r'\1-****-****-\4', text)
    
    return text


def analyze_log_file(filepath):
    """로그 파일에서 레벨별 발생 횟수를 집계한다.

    Args:
        filepath (str): 분석할 로그 파일 경로.

    Returns:
        dict[str, int]: 전체 줄 수와 INFO·WARNING·ERROR·CRITICAL 건수를 담은 딕셔너리.
    """
    stats = {
        'total': 0,
        'info': 0,
        'warning': 0,
        'error': 0,
        'critical': 0
    }
    
    with open(filepath, 'r') as f:
        for line in f:
            stats['total'] += 1
            if 'INFO' in line:
                stats['info'] += 1
            elif 'WARNING' in line:
                stats['warning'] += 1
            elif 'ERROR' in line:
                stats['error'] += 1
            elif 'CRITICAL' in line:
                stats['critical'] += 1
    
    return stats
