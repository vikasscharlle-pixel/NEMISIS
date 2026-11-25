import logging
from typing import Optional

import redis

from core.config import get_settings

logger = logging.getLogger("nemesis.redis")
settings = get_settings()

_redis_client: Optional[redis.Redis] = None


def get_redis_client() -> Optional[redis.Redis]:
    """Return a Redis client if reachable, or None for graceful local fallback."""
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    try:
        client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1)
        client.ping()
        _redis_client = client
        return _redis_client
    except Exception as exc:
        logger.debug("Redis unavailable (%s); continuing without cache.", exc)
        return None


def check_redis_health() -> str:
    """Return health string for Redis status reporting."""
    try:
        client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1)
        if client.ping():
            return "connected"
    except Exception:
        pass
    return "unavailable"
