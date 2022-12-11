from flask import Flask, send_from_directory

application = Flask(__name__, static_url_path="", static_folder="build", template_folder="build")


@application.route("/")
def index():
    return send_from_directory(application.static_folder, "index.html")


if __name__ == "__main__":
    application.run()