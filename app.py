from flask import Flask, render_template, request, send_file, abort
from io import BytesIO
from weasyprint import HTML, CSS

app = Flask(__name__, static_folder="static", template_folder="templates")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/pdf", methods=["POST"])
def api_pdf():
    """
    Reçoit un JSON comme:
    {
      "menus": [
        {
          "name": "Menu du midi",
          "entrees": [{"name":"...", "note":"...", "allergens":["...","..."]}],
          "plats":   [...],
          "desserts":[...]
        }
      ]
    }
    -> Retourne un PDF généré depuis print.html (Jinja) + CSS
    """
    data = request.get_json(silent=True)
    if not data or "menus" not in data or not isinstance(data["menus"], list):
        abort(400, "JSON invalide. Attendu: { menus: [...] }")

    html = render_template("print.html", menus=data["menus"])

    pdf_io = BytesIO()
    HTML(string=html, base_url=request.url_root).write_pdf(pdf_io)
    
    pdf_io.seek(0)
    return send_file(pdf_io, mimetype="application/pdf", as_attachment=True, download_name="menus.pdf")

if __name__ == "__main__":
    # Accès depuis l’iPhone sur le même Wi-Fi
    app.run(host="0.0.0.0", port=5000, debug=True)
