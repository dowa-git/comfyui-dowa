"""
DOWA Navigation Node
Persistent navigation bar for ComfyUI with user authentication and management.
"""

class DowaNavigationNode:
    """
    Navigation bar node that provides UI for:
    - User login/logout
    - Profile management
    - Workflow templates
    - Shared workflows
    - User settings

    This node is invisible in the workflow - all UI is rendered via JavaScript widget.
    """

    @classmethod
    def INPUT_TYPES(cls):
        return {
            "required": {},
            "hidden": {
                "unique_id": "UNIQUE_ID",
                "extra_pnginfo": "EXTRA_PNGINFO",
                "prompt": "PROMPT"
            }
        }

    RETURN_TYPES = ()
    FUNCTION = "render_navigation"
    OUTPUT_NODE = True
    CATEGORY = "dowa/ui"

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        # Always execute to keep navigation state updated
        return float("nan")

    def render_navigation(self, unique_id=None, extra_pnginfo=None, prompt=None):
        """
        This function executes on every workflow run.
        The actual UI rendering is handled by the JavaScript extension.

        Returns empty dict as this is a UI-only node.
        """
        return {}


# Optional: Custom API routes for navigation-specific backend operations
try:
    from server import PromptServer
    from aiohttp import web
    import logging

    logger = logging.getLogger(__name__)

    @PromptServer.instance.routes.get("/dowa/navigation/status")
    async def get_navigation_status(request):
        """Health check for navigation widget"""
        return web.json_response({
            "status": "active",
            "version": "1.0.0",
            "features": [
                "authentication",
                "templates",
                "shared_workflows",
                "user_settings"
            ]
        })

    logger.info("✅ DOWA Navigation API routes registered")

except ImportError:
    # PromptServer not available (e.g., during import phase)
    pass
