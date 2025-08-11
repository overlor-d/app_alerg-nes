# Image légère Python
FROM python:3.11-slim

# Dépendances système nécessaires à WeasyPrint (cairo, pango, gdk-pixbuf) + polices
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libharfbuzz0b \
    libfreetype6 \
    libfontconfig1 \
    libglib2.0-0 \
    fonts-dejavu-core \
  > /dev/null \
  && rm -rf /var/lib/apt/lists/*


WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt



# Copie du code
COPY . .

# Port exposé dans le conteneur
EXPOSE 4000

# Lancement en prod avec gunicorn, binding sur 0.0.0.0:4000
CMD ["gunicorn", "-w", "2", "-b", "0.0.0.0:4000", "app:app"]
