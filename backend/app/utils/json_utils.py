import json
from typing import Any, List


def parse_json_str(json_text: str) -> Any:
    return json.loads(json_text)


def extract_paths(obj: Any, base: str = "") -> List[str]:
    paths: List[str] = []
    if isinstance(obj, dict):
        for key, value in obj.items():
            new_base = f"{base}.{key}" if base else key
            paths.append(new_base)
            paths.extend(extract_paths(value, new_base))
    elif isinstance(obj, list):
        for index, value in enumerate(obj):
            new_base = f"{base}[{index}]"
            paths.append(new_base)
            paths.extend(extract_paths(value, new_base))
    else:
        # primitive types, no further descent
        pass
    return paths
