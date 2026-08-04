from flask import request, jsonify
from routes.initializations import app
from database.database import db, Subchessits

@app.route("/getSimilarResults", methods=["GET"])
def similar_results():
    try:        
        searchTerm = request.args.get("searchterm")
        
        if not searchTerm:
            return jsonify({
                    "messagetype": "Error",
                    "message": "search term is missing" 
                }),400
        
        #gets 10 rows of data that starts with the input user gave ()
        similar_results = db.session.execute(db.select(Subchessits).where(Subchessits.title.istartswith(searchTerm)).limit(10)).scalars().all() 
        #store them in a list
        results = []
        for result in similar_results:
            results.append({
                "id": result.id,       
                "title": result.title  
            })
        
        return jsonify(results),200

        
    except Exception as error:
        print("similar results error")
        print(str(error))

        return jsonify({
            "messagetype": "Error",
            "message": "Internal Server Error"
            }),500 
        
