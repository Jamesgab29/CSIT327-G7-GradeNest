import time

def static_cache_buster(request):
    """
    Add a timestamp to break browser cache for static files in development
    """
    return {
        'CACHE_VERSION': int(time.time())
    }
