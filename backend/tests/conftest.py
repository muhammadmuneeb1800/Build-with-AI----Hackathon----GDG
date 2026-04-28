"""
pytest configuration and fixtures for the test suite.

This file is automatically loaded by pytest and configures:
- Test database
- Async test support
- Test fixtures
- Environment variables
"""

import os
import sys
from pathlib import Path

import pytest

# Add the backend directory to the path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))


@pytest.fixture(scope="session")
def test_config():
    """Test configuration fixture."""
    os.environ["TESTING"] = "true"
    return {
        "database_url": "sqlite:///:memory:",
        "testing": True
    }


@pytest.fixture
def anyio_backend():
    """Configure anyio backend for async tests."""
    return "asyncio"


# Configure pytest markers
def pytest_configure(config):
    """Register pytest markers."""
    config.addinivalue_line(
        "markers", "asyncio: mark test as async"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as integration"
    )
    config.addinivalue_line(
        "markers", "e2e: mark test as end-to-end"
    )
