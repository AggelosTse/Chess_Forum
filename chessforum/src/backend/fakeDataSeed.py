import sys,os
from flask import Flask
from faker import Faker
import random
from server import app

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.database import db, Roles,Users,Posts,Comments,Subchessits

app.config["SQLALCHEMY_DATABASE_URI"]= os.getenv('databaseURL')

fake = Faker()

def addData():
    
    with app.app_context():
        print("Starting database seed...")
        
        # 1. Handle Roles (Ensures standard roles exist)
        print("Checking/Seeding Roles...")
        admin_role = Roles.query.filter_by(name="admin").first()
        user_role = Roles.query.filter_by(name="user").first()
        
        if not admin_role:
            admin_role = Roles(name="admin")
            db.session.add(admin_role)
        if not user_role:
            user_role = Roles(name="user")
            db.session.add(user_role)
            
        db.session.commit() # Save roles to generate IDs
        
        # 2. Seed Subchessits (Forums)
        print("Seeding Subchessits...")
        subchessit_topics = ["Openings", "Endgames", "Tactics", "Memes", "Tournaments"]
        subchessits_list = []
        
        for topic in subchessit_topics:
            # Check if it already exists to prevent duplicate title errors
            sub = Subchessits.query.filter_by(title=topic).first()
            if not sub:
                sub = Subchessits(
                    title=topic,
                    description=fake.sentence(nb_words=10)
                )
                db.session.add(sub)
            subchessits_list.append(sub)
            
        db.session.commit()

        # 3. Seed Users
        print("Seeding 10 Users...")
        users_list = []
        for _ in range(10):
            user = Users(
                username=fake.unique.user_name()[:30], # Truncate to match String(30)
                email=fake.unique.email()[:30],
                password="hashed_password_placeholder", # Replace with your hashing if needed
                roles=user_role # Wires the Roles relationship automatically!
            )
            db.session.add(user)
            users_list.append(user)
            
        db.session.commit()

        # 4. Seed Posts
        print("Seeding 20 Posts...")
        posts_list = []
        chess_titles = [
            "How do I counter the Queen's Gambit?",
            "Is the Caro-Kann defense still viable?",
            "Analysis of Magnus Carlsen's latest game",
            "Blundered my queen on turn 5, AMA",
            "Tips for crossing the 1500 ELO barrier",
            "Why the London System gets so much hate",
            "My favorite tactical puzzle of the week"
        ]
        
        for _ in range(20):
            # Mix real chess topics with fake sentences
            title = random.choice(chess_titles) if random.random() < 0.6 else fake.sentence(nb_words=6)
            
            post = Posts(
                title=title[:100], # Max length String(100)
                image=fake.image_url()[:150], # Max length String(150)
                description=fake.paragraph(nb_sentences=4),
                users=random.choice(users_list),         # Wires user_id
                subchessits=random.choice(subchessits_list) # Wires subchessit_id
            )
            db.session.add(post)
            posts_list.append(post)
            
        db.session.commit()

        # 5. Seed Comments
        print("Seeding 40 Comments...")
        for _ in range(40):
            comment = Comments(
                text=fake.sentence(nb_words=12),
                users=random.choice(users_list), # Links back to a user account
                posts=random.choice(posts_list), # Links back to a specific post
                parent_id=None # Keeping it simple with flat comments for now
            )
            db.session.add(comment)
            
        db.session.commit()
        print("🚀 Database successfully seeded with clean relational data!")

if __name__ == "__main__":
    addData()    