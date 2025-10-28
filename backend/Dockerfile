# backend/Dockerfile (Optimized with Multi-Stage Build)

# --- Stage 1: The Builder ---
# Use a full Python image to build dependencies
FROM python:3.12-slim as builder

WORKDIR /app

# Install build tools needed for some packages
RUN pip install --upgrade pip

# Copy only the requirements file
COPY requirements.txt .

# Install dependencies into a temporary location
RUN pip wheel --no-cache-dir --wheel-dir=/app/wheels -r requirements.txt


# --- Stage 2: The Final Image ---
# Use a tiny, minimal Python image for the final product
FROM python:3.12-slim

WORKDIR /app

# Copy the pre-compiled wheels from the builder stage
COPY --from=builder /app/wheels /wheels

# Install the dependencies from the local wheels
RUN pip install --no-cache /wheels/*

# Copy the application code
COPY . .

# Expose the port and run the application
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]