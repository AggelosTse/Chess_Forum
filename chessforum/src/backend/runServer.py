from routes.initializations import app,db

if __name__ == "__main__":
    with app.app_context():
        db.create_all() #create the database tables
    app.run(debug=True, port=8001)