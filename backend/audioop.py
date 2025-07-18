# audioop.py — stub so pydub can import audioop
# Provides just enough functions so import succeeds.

def max(fragment, width):
    # return a non‑zero to avoid divide‑by‑zero if used
    return 1

def rms(fragment, width):
    # return a small positive value
    return 1

def lin2lin(fragment, width, width2):
    return fragment

def ulaw2lin(fragment, width):
    return fragment

def lin2ulaw(fragment, width):
    return fragment
