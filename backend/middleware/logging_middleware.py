import logging
import time

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("nemesis.http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs HTTP method, path, response status, and processing time."""

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info("%s %s -> %d (%.2f ms)", request.method, request.url.path, response.status_code, duration_ms)
        response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"
        return response
