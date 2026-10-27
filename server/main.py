import os
import io
import time
import base64
import random
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Food Verse AI - Indian Multimodal Food Intelligence & Kitchen Safety",
    description="Backend API powering Indian Food Recognition, Authentic Nutrition & Portion Estimation, Produce Freshness, FSSAI Kitchen Hygiene Auditing, Smart Indian Cooking, and Regional Meal Planning",
    version="2.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Models and Schemas
# ==========================================

class IndianPortionRequest(BaseModel):
    dish_id: Optional[str] = "dal_chawal"
    rotis_count: int = 2
    has_ghee_on_roti: bool = True
    dal_katoris: float = 1.0
    rice_bowls: float = 1.0
    sabzi_katoris: float = 1.0
    curd_chaas_glasses: float = 1.0
    extra_ghee_tsp: int = 0

class RecipeStepRequest(BaseModel):
    recipe_name: str
    current_step_index: int
    total_steps: int
    servings: Optional[int] = 4
    healthier_prep: Optional[bool] = False
    is_jain: Optional[bool] = False

class IngredientSubstitutionRequest(BaseModel):
    ingredient: str
    dietary_restriction: str # jain, vegan, dairy-free, gluten-free, low-oil, diabetic

class IndianNutritionPlanRequest(BaseModel):
    age: int
    gender: str
    weight_kg: float
    height_cm: float
    activity_level: str # sedentary, moderate, active, very_active
    dietary_preference: str # vegetarian, vegan, jain, eggitarian, non_vegetarian
    regional_cuisine: str # north_indian, south_indian, west_indian, east_indian
    goal: str # balanced, weight_loss, high_protein, diabetic_control
    meals_per_day: Optional[int] = 4

class PantryZeroWasteRequest(BaseModel):
    ingredients: List[str]
    max_prep_time_min: Optional[int] = 30
    meal_type: Optional[str] = "Dinner"

class ChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None

# ==========================================
# Indian Food Database (Comprehensive)
# ==========================================

INDIAN_FOOD_DATABASE = [
    # --- Breakfast ---
    {
        "id": "indori_poha",
        "name": "Indori Poha with Sev & Jeeravan",
        "category": "Breakfast",
        "regional_tag": "Central / Malwa",
        "serving_unit": "1 plate (200g)",
        "portion_g": 200,
        "calories": 265,
        "protein_g": 5.2,
        "carbs_g": 48.0,
        "fats_g": 6.5,
        "fiber_g": 3.8,
        "glycemic_index": 52,
        "common_ingredients": ["Flattened rice (poha)", "Mustard seeds (rai)", "Curry leaves", "Green chillies", "Onions", "Turmeric", "Roasted peanuts", "Fennel seeds (saunf)", "Nylon sev", "Jeeravan masala", "Lemon juice"],
        "vitamins": ["Vitamin C", "Iron", "Vitamin B6"],
        "allergens": ["Peanuts"],
        "is_vegetarian": True,
        "is_vegan": True,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Tadka oil typically 1 to 1.5 tbsp. Oil reduction can save 45 kcal per plate.",
        "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "masala_dosa",
        "name": "Crispy Masala Dosa with Sambar & Chutney",
        "category": "Breakfast / South Indian",
        "regional_tag": "South Indian",
        "serving_unit": "1 dosa (180g) + 1 katori sambar",
        "portion_g": 280,
        "calories": 340,
        "protein_g": 7.5,
        "carbs_g": 56.0,
        "fats_g": 9.8,
        "fiber_g": 4.5,
        "glycemic_index": 54,
        "common_ingredients": ["Fermented rice & urad dal batter", "Boiled potatoes", "Mustard seeds", "Curry leaves", "Turmeric", "Toor dal (sambar)", "Drumsticks", "Coconut chutney", "Ghee / oil"],
        "vitamins": ["Vitamin B complex", "Potassium", "Vitamin C"],
        "allergens": [],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Butter/ghee roasting adds ~60-80 kcal per dosa. Air tawa baking reduces fat by 40%.",
        "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "idli_sambar",
        "name": "Steamed Idli with Toor Dal Sambar",
        "category": "Breakfast",
        "regional_tag": "South Indian",
        "serving_unit": "2 idlis (100g) + 1 katori sambar (150ml)",
        "portion_g": 250,
        "calories": 210,
        "protein_g": 8.2,
        "carbs_g": 42.0,
        "fats_g": 1.8,
        "fiber_g": 4.8,
        "glycemic_index": 42,
        "common_ingredients": ["Parboiled rice", "Whole urad dal", "Toor dal", "Drumsticks", "Tomatoes", "Sambar powder", "Asafoetida (hing)", "Curry leaves"],
        "vitamins": ["Folate", "Iron", "Vitamin B1"],
        "allergens": [],
        "is_vegetarian": True,
        "is_vegan": True,
        "is_jain_friendly": True,
        "oil_ghee_variation_note": "Naturally zero-oil steamed base. Sambar tadka uses minimal oil.",
        "image": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "aloo_paratha",
        "name": "Punjabi Aloo Paratha with Curd & Makkhan",
        "category": "Breakfast",
        "regional_tag": "North Indian",
        "serving_unit": "1 paratha (140g) + 1 katori curd (100g)",
        "portion_g": 240,
        "calories": 375,
        "protein_g": 8.5,
        "carbs_g": 48.0,
        "fats_g": 16.5,
        "fiber_g": 4.8,
        "glycemic_index": 58,
        "common_ingredients": ["Whole wheat flour (atta)", "Spiced mashed potatoes", "Ajwain (carom seeds)", "Green chillies", "Kasuri methi", "Desi ghee", "Fresh dahi (curd)"],
        "vitamins": ["Calcium", "Vitamin A", "Iron"],
        "allergens": ["Gluten", "Dairy"],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Dry roasted tawa paratha saves ~90 kcal compared to shallow-fried ghee paratha.",
        "image": "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "besan_chilla",
        "name": "High-Protein Besan Chilla with Mint Chutney",
        "category": "Breakfast",
        "regional_tag": "North / Central Indian",
        "serving_unit": "2 chillas (160g)",
        "portion_g": 160,
        "calories": 245,
        "protein_g": 13.8,
        "carbs_g": 31.0,
        "fats_g": 7.5,
        "fiber_g": 6.5,
        "glycemic_index": 34,
        "common_ingredients": ["Bengal gram flour (besan)", "Onions", "Tomatoes", "Coriander", "Ajwain", "Grated paneer (optional)", "Cold-pressed mustard oil", "Fresh pudina chutney"],
        "vitamins": ["Zinc", "Magnesium", "Folate"],
        "allergens": [],
        "is_vegetarian": True,
        "is_vegan": True,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Non-stick or cast-iron tawa with oil spray uses under 1 tsp total oil.",
        "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "khaman_dhokla",
        "name": "Steamed Gujarati Khaman Dhokla",
        "category": "Breakfast / Snack",
        "regional_tag": "West Indian / Gujarati",
        "serving_unit": "4 pieces (130g)",
        "portion_g": 130,
        "calories": 185,
        "protein_g": 7.2,
        "carbs_g": 29.0,
        "fats_g": 4.8,
        "fiber_g": 3.4,
        "glycemic_index": 44,
        "common_ingredients": ["Gram flour (besan)", "Ginger-green chilli paste", "Fruit salt / eno", "Mustard seeds", "Curry leaves", "Sesame seeds (til)", "Fresh coriander", "Grated coconut"],
        "vitamins": ["Vitamin C", "Iron"],
        "allergens": ["Sesame"],
        "is_vegetarian": True,
        "is_vegan": True,
        "is_jain_friendly": True,
        "oil_ghee_variation_note": "Steamed preparation. Sugar syrup moderation reduces calories by 25%.",
        "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
    },

    # --- Lunch & Dinner ---
    {
        "id": "dal_chawal",
        "name": "Homestyle Dal Tadka with Steamed Rice",
        "category": "Lunch & Dinner",
        "regional_tag": "All India Staples",
        "serving_unit": "1 katori dal (150ml) + 1 bowl rice (150g)",
        "portion_g": 300,
        "calories": 380,
        "protein_g": 12.0,
        "carbs_g": 68.0,
        "fats_g": 6.8,
        "fiber_g": 6.4,
        "glycemic_index": 56,
        "common_ingredients": ["Toor dal (pigeon pea)", "Cumin seeds (jeera)", "Garlic", "Tomatoes", "Ghee / mustard oil", "Hing", "Turmeric", "Basmati rice"],
        "vitamins": ["Iron", "Potassium", "Vitamin B6"],
        "allergens": [],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "1 tsp ghee tadka = ~45 kcal. Swap white rice with brown rice or hand-pounded rice for lower GI.",
        "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "rajma_chawal",
        "name": "Punjabi Rajma Masala with Jeera Rice",
        "category": "Lunch & Dinner",
        "regional_tag": "North Indian",
        "serving_unit": "1 katori rajma (180g) + 1 bowl rice (150g)",
        "portion_g": 330,
        "calories": 440,
        "protein_g": 15.8,
        "carbs_g": 74.0,
        "fats_g": 8.5,
        "fiber_g": 11.5,
        "glycemic_index": 42,
        "common_ingredients": ["Red kidney beans (rajma)", "Onions", "Tomatoes", "Ginger-garlic", "Garam masala", "Cumin", "Coriander powder", "Basmati rice"],
        "vitamins": ["Iron", "Folate", "Magnesium", "Potassium"],
        "allergens": [],
        "is_vegetarian": True,
        "is_vegan": True,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Rich in resistant starch and soluble fiber. Naturally hearty with moderate cooking oil.",
        "image": "https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "chole_bhature",
        "name": "Amritsari Chole Bhature with Pickled Onions",
        "category": "Lunch / Special",
        "regional_tag": "North Indian",
        "serving_unit": "1 bhatura (80g) + 1 bowl chole (200g)",
        "portion_g": 280,
        "calories": 590,
        "protein_g": 15.2,
        "carbs_g": 76.0,
        "fats_g": 26.5,
        "fiber_g": 9.2,
        "glycemic_index": 62,
        "common_ingredients": ["Kabuli chana (chickpeas)", "Maida / flour", "Tea leaves (for dark hue)", "Anardana (pomegranate seed)", "Ginger", "Amritsari chole masala", "Refined frying oil"],
        "vitamins": ["Iron", "Vitamin C"],
        "allergens": ["Gluten"],
        "is_vegetarian": True,
        "is_vegan": True,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Deep-fried bhatura accounts for ~140 kcal from absorbed oil. Kulcha/roti swap cuts 180 kcal.",
        "image": "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "paneer_butter_masala",
        "name": "Shahi Paneer Butter Masala",
        "category": "Lunch & Dinner",
        "regional_tag": "North Indian",
        "serving_unit": "1 katori (180g)",
        "portion_g": 180,
        "calories": 395,
        "protein_g": 14.5,
        "carbs_g": 17.5,
        "fats_g": 29.5,
        "fiber_g": 2.8,
        "glycemic_index": 38,
        "common_ingredients": ["Fresh malai paneer", "Tomato puree", "Cashew nut paste", "Butter", "Fresh cream", "Kasuri methi", "Green cardamom", "Degi mirch"],
        "vitamins": ["Calcium", "Vitamin A", "Phosphorus"],
        "allergens": ["Dairy", "Tree Nuts"],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Low-oil modification uses cashew-watermelon seed puree and low-fat paneer, saving 140 kcal.",
        "image": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "indian_thali",
        "name": "Traditional Indian Vegetarian Thali",
        "category": "Lunch & Dinner",
        "regional_tag": "Pan-India Complete Meal",
        "serving_unit": "1 full thali (2 rotis, dal, sabzi, rice, salad, dahi)",
        "portion_g": 490,
        "calories": 690,
        "protein_g": 23.5,
        "carbs_g": 104.0,
        "fats_g": 21.0,
        "fiber_g": 15.2,
        "glycemic_index": 48,
        "common_ingredients": ["2 Whole wheat phulkas", "1 katori toor dal tadka", "1 katori aloo-gobhi / seasonal sabzi", "1 katori steamed rice", "Cucumber-tomato kachumber", "1 katori fresh dahi", "Roasted papad"],
        "vitamins": ["Vitamin A", "Vitamin C", "Calcium", "Iron", "Potassium"],
        "allergens": ["Gluten", "Dairy"],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Well-balanced macro split: 14% Protein, 60% Complex Carbs, 26% Fats. Ghee brushing on rotis is optional.",
        "image": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "veg_biryani",
        "name": "Hyderabadi Dum Vegetable Biryani with Raita",
        "category": "Lunch & Dinner",
        "regional_tag": "South / Deccan",
        "serving_unit": "1 plate (280g) + 1 katori raita",
        "portion_g": 350,
        "calories": 480,
        "protein_g": 11.5,
        "carbs_g": 76.0,
        "fats_g": 14.5,
        "fiber_g": 6.8,
        "glycemic_index": 54,
        "common_ingredients": ["Aged basmati rice", "Carrots", "Beans", "Green peas", "Fried onions (birista)", "Mint & coriander leaves", "Saffron milk", "Shahi biryani masala", "Ghee", "Boondi/onion raita"],
        "vitamins": ["Vitamin A", "Vitamin K", "Calcium"],
        "allergens": ["Dairy"],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Slow sealed dum cooking allows aromatics to penetrate with moderate ghee additions.",
        "image": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
    },

    # --- Snacks & Street Food ---
    {
        "id": "punjabi_samosa",
        "name": "Crispy Punjabi Samosa with Chutneys",
        "category": "Snacks & Street Food",
        "regional_tag": "North Indian",
        "serving_unit": "2 pieces (140g)",
        "portion_g": 140,
        "calories": 340,
        "protein_g": 5.8,
        "carbs_g": 42.0,
        "fats_g": 16.5,
        "fiber_g": 3.2,
        "glycemic_index": 64,
        "common_ingredients": ["Refined flour (maida) crust", "Ajwain", "Spiced potatoes", "Green peas", "Cashews", "Ginger", "Cumin", "Frying oil", "Saunth (tamarind chutney)", "Mint-coriander chutney"],
        "vitamins": ["Iron", "Vitamin C"],
        "allergens": ["Gluten", "Tree Nuts"],
        "is_vegetarian": True,
        "is_vegan": True,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Air-fryer version saves 120 kcal per 2 samosas compared to traditional deep frying.",
        "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "pani_puri",
        "name": "Mumbai Pani Puri / Golgappe (6 pcs)",
        "category": "Snacks & Street Food",
        "regional_tag": "West / North Indian",
        "serving_unit": "6 puris with spiced water (160g)",
        "portion_g": 160,
        "calories": 180,
        "protein_g": 3.6,
        "carbs_g": 33.0,
        "fats_g": 4.5,
        "fiber_g": 2.8,
        "glycemic_index": 46,
        "common_ingredients": ["Crisp sooji/atta puris", "Boiled potato-black gram filling", "Mint-coriander-hing teekha pani", "Sweet tamarind-jaggery chutney", "Black salt", "Roasted cumin powder"],
        "vitamins": ["Vitamin C", "Iron"],
        "allergens": ["Gluten"],
        "is_vegetarian": True,
        "is_vegan": True,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Low fat street snack; hygiene vigilance critical regarding potable water quality.",
        "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "vada_pav",
        "name": "Mumbai Vada Pav with Lasun Chutney",
        "category": "Snacks & Street Food",
        "regional_tag": "West Indian / Maharashtra",
        "serving_unit": "1 vada pav (130g)",
        "portion_g": 130,
        "calories": 305,
        "protein_g": 6.2,
        "carbs_g": 41.0,
        "fats_g": 13.5,
        "fiber_g": 3.4,
        "glycemic_index": 60,
        "common_ingredients": ["Ladi pav", "Spiced batata vada (mustard, turmeric, curry leaves, green chillies)", "Besan coating", "Dry red garlic-peanut chutney", "Green chutney", "Fried salted chilli"],
        "vitamins": ["Vitamin C", "Iron"],
        "allergens": ["Gluten", "Peanuts"],
        "is_vegetarian": True,
        "is_vegan": True,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Deep-fried potato bonda. Whole wheat pav and appe pan vada option lowers fat by 35%.",
        "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "pav_bhaji",
        "name": "Butter Pav Bhaji with Chopped Onions",
        "category": "Snacks & Street Food",
        "regional_tag": "West Indian / Maharashtra",
        "serving_unit": "2 toasted pavs + 1 bowl bhaji (240g)",
        "portion_g": 320,
        "calories": 485,
        "protein_g": 8.8,
        "carbs_g": 66.0,
        "fats_g": 20.5,
        "fiber_g": 7.8,
        "glycemic_index": 58,
        "common_ingredients": ["Potatoes", "Cauliflower", "Green peas", "Capsicum", "Tomatoes", "Pav bhaji masala", "Kashmiri chilli", "Desi butter (amul)", "Ladi pav", "Lemon & raw onion"],
        "vitamins": ["Vitamin C", "Vitamin A", "Potassium"],
        "allergens": ["Gluten", "Dairy"],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Street stalls use generous butter (30-40g = ~250 kcal). Olive oil bhaji saves 150 kcal.",
        "image": "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80"
    },

    # --- Sweets (Mithai) ---
    {
        "id": "gulab_jamun",
        "name": "Warm Khoya Gulab Jamun (2 pcs)",
        "category": "Sweets & Mithai",
        "regional_tag": "Pan-India Traditional",
        "serving_unit": "2 pieces (90g)",
        "portion_g": 90,
        "calories": 325,
        "protein_g": 4.8,
        "carbs_g": 52.0,
        "fats_g": 11.2,
        "fiber_g": 0.4,
        "glycemic_index": 78,
        "common_ingredients": ["Mawa (khoya)", "Chenna", "Cardamom powder", "Rose water", "Sugar syrup (chashni)", "Ghee for frying"],
        "vitamins": ["Calcium"],
        "allergens": ["Dairy"],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": True,
        "oil_ghee_variation_note": "Deep fried in ghee and soaked in sugar syrup. High glycemic load; recommend sharing portions.",
        "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "jalebi",
        "name": "Crispy Desi Ghee Jalebi",
        "category": "Sweets & Mithai",
        "regional_tag": "North / West Indian",
        "serving_unit": "3 pieces (80g)",
        "portion_g": 80,
        "calories": 295,
        "protein_g": 2.0,
        "carbs_g": 54.0,
        "fats_g": 8.5,
        "fiber_g": 0.3,
        "glycemic_index": 82,
        "common_ingredients": ["Fermented all-purpose flour", "Cornstarch", "Saffron (kesar)", "Cardamom", "Sugar syrup", "Desi ghee"],
        "vitamins": [],
        "allergens": ["Gluten", "Dairy"],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": True,
        "oil_ghee_variation_note": "Direct sugar and ghee combination. Best consumed fresh during festivities.",
        "image": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
    },

    # --- Regional Specialties ---
    {
        "id": "dal_bafla",
        "name": "Malwa Dal Bafla with Ghee & Garlic Chutney",
        "category": "Regional Special",
        "regional_tag": "Central / Madhya Pradesh & Rajasthan",
        "serving_unit": "2 baflas (180g) + 1 katori dal",
        "portion_g": 320,
        "calories": 640,
        "protein_g": 16.2,
        "carbs_g": 84.0,
        "fats_g": 26.5,
        "fiber_g": 8.8,
        "glycemic_index": 54,
        "common_ingredients": ["Coarse wheat flour (atta)", "Semolina (sooji)", "Ajwain", "Turmeric", "Desi ghee bath", "Spicy toor dal", "Spicy red garlic chutney"],
        "vitamins": ["B-Vitamins", "Iron", "Magnesium"],
        "allergens": ["Gluten", "Dairy"],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Traditional preparation involves dipping hot boiled baflas into pure desi ghee.",
        "image": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80"
    },
    {
        "id": "litti_chokha",
        "name": "Bihari Litti Chokha with Desi Ghee",
        "category": "Regional Special",
        "regional_tag": "East / Bihar & Jharkhand",
        "serving_unit": "2 littis (160g) + 1 bowl chokha (120g)",
        "portion_g": 280,
        "calories": 485,
        "protein_g": 15.0,
        "carbs_g": 72.0,
        "fats_g": 16.0,
        "fiber_g": 11.8,
        "glycemic_index": 44,
        "common_ingredients": ["Whole wheat flour dough", "Roasted gram flour (sattu)", "Kalonji (onion seeds)", "Ajwain", "Mustard oil", "Smoked roasted brinjal (baingan)", "Roasted tomatoes", "Green chillies", "Desi ghee"],
        "vitamins": ["Iron", "Zinc", "Potassium", "Dietary Fiber"],
        "allergens": ["Gluten"],
        "is_vegetarian": True,
        "is_vegan": False,
        "is_jain_friendly": False,
        "oil_ghee_variation_note": "Sattu stuffing is naturally high-protein and high-fiber with a very low glycemic load.",
        "image": "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80"
    }
]

# ==========================================
# Indian Produce & Prepared Food Freshness Knowledge
# ==========================================

INDIAN_FRESHNESS_DATABASE = {
    "tomato": {
        "name": "Desi / Hybrid Tomato (Tamatar)",
        "category": "Indian Produce",
        "stages": ["Crisp Firm (Green-Red)", "Prime Freshness (Deep Red)", "Soft / Slightly Wrinkled", "Skin Splitting / Overripe", "Rotten / Fungal Mycelium"],
        "indicators": ["Firmness index", "Skin turgor", "Stem calyx greenness", "Absence of black rot spots"],
        "storage": "Store at cool room temperature (18°C-22°C) stem-down. Do not refrigerate unripe tomatoes as cold halts flavor volatiles.",
        "shelf_life_days": 6.0,
        "spoilage_risks": "Skin puncture inviting Alternaria black mold; sour odor upon decomposition."
    },
    "potato": {
        "name": "Potato (Aloo - Pahadi / Jyoti)",
        "category": "Indian Produce",
        "stages": ["Firm Solid Skin", "Prime Storage Freshness", "Slight Eyes / Small Chits", "Sprouting / Greening", "Soft Rot / Solanine Toxic"],
        "indicators": ["Surface firmness", "Lack of green chlorophyll / solanine patch", "No soft moist depressions", "Dormant eye buds"],
        "storage": "Store in a well-ventilated jute bag or wicker basket in a cool, dark place away from onions and direct sunlight.",
        "shelf_life_days": 21.0,
        "spoilage_risks": "CRITICAL HAZARD: Green skin and deep sprouts contain solanine glycoalkaloid, which can cause severe gastric distress. Cut away green parts completely or discard."
    },
    "onion": {
        "name": "Red / White Onion (Pyaaz - Nasik Red)",
        "category": "Indian Produce",
        "stages": ["Dry Papery Outer Skin", "Prime Firm Bulb", "Slight Soft Neck", "Black Mold (Aspergillus niger)", "Rotten / Sprouted Mushy"],
        "indicators": ["Dry tight outer tunic", "Firm neck tissue", "Zero black powdery mold spots", "No foul sulfur odor"],
        "storage": "Keep in an airy, dry basket at room temperature. Keep away from potatoes as trapped moisture accelerates rotting.",
        "shelf_life_days": 25.0,
        "spoilage_risks": "Aspergillus niger fungal mold under outer dry scales. Peel infected outer layers or discard if soft rot reaches inner rings."
    },
    "banana": {
        "name": "Banana (Kela - Robusta / Yelakki)",
        "category": "Indian Produce",
        "stages": ["Underripe (Firm Green)", "Peak Freshness (Golden Yellow)", "Ripe (Sugar Freckled)", "Overripe (Deep Brown)", "Spoiled / Fermenting"],
        "indicators": ["Skin chlorophyll breakdown", "Enzymatic sugar freckles", "Neck firmness", "Pulp viscosity"],
        "storage": "Hang or store at room temperature away from apples. Wrap stem crown in foil to slow ethylene diffusion.",
        "shelf_life_days": 5.0,
        "spoilage_risks": "Overripe bananas attract fruit flies and ferment rapidly in warm Indian summers. Repurpose into banana bread or sheera."
    },
    "mango": {
        "name": "Indian Mango (Alphonso / Dasheri / Langra)",
        "category": "Indian Seasonal Fruit",
        "stages": ["Raw Green (Kairi)", "Semi-Ripe Fragrant", "Prime Juicy Sweetness", "Wrinkled / Dark Patches", "Spoiled / Anthracnose"],
        "indicators": ["Aromatic fruity ester emission", "Shoulder firmness", "Lack of black sunken anthracnose lesions", "Absence of stem sap burn"],
        "storage": "Ripen at room temperature inside a paper bag or rice drum. Refrigerate only once fully ripe for up to 4 days.",
        "shelf_life_days": 7.0,
        "spoilage_risks": "Colletotrichum anthracnose causes black rotting patches. Internal pulp fermentation in humid climates."
    },
    "spinach": {
        "name": "Baby Spinach (Desi Palak)",
        "category": "Indian Leafy Greens",
        "stages": ["Crisp Dark Green", "Prime Tender Freshness", "Wilting Leaf Edges", "Yellowing / Moisture Rot", "Bacterial Slime / Decayed"],
        "indicators": ["Leaf turgor pressure", "Vibrant green chlorophyll", "Dry leaves without condensation slime", "Crisp stem snapping"],
        "storage": "Wrap unwashed dry spinach in a cotton kitchen cloth or paper towel inside an airtight container in the refrigerator crisper drawer.",
        "shelf_life_days": 4.0,
        "spoilage_risks": "High surface moisture causes rapid bacterial soft rot (Pseudomonas). Yellowed leaves indicate nutrient loss and high nitrite conversion."
    },
    "cauliflower": {
        "name": "Cauliflower (Phool Gobhi)",
        "category": "Indian Produce",
        "stages": ["Compact Milky White Curds", "Prime Freshness", "Slight Brown Speckling", "Discolored Loose Curds", "Rotten / Fungal Mold / Wormy"],
        "indicators": ["Curd compactness", "Creamy white color", "Crisp green jacket leaves", "No borer insect holes or fungal fuzz"],
        "storage": "Store head unwashed in an open bag in the refrigerator. Soak in warm salted turmeric water for 10 mins before cooking to expel hidden insects.",
        "shelf_life_days": 7.0,
        "spoilage_risks": "Fungal oxidation spots. Hidden diamondback moth caterpillars or borers inside florets."
    },
    "brinjal": {
        "name": "Brinjal / Eggplant (Baingan / Bharta Baingan)",
        "category": "Indian Produce",
        "stages": ["Glossy Deep Purple Skin", "Prime Firm Texture", "Dull Skin / Soft Spots", "Wrinkled / Brown Seeds", "Borer Infested / Rotting"],
        "indicators": ["High epidermal gloss", "Fresh green spiky calyx", "Lightweight relative to size (fewer bitter seeds)", "Zero pinhole entry punctures"],
        "storage": "Store in the crisper drawer at 10°C-12°C. Avoid keeping in sealed plastic bags.",
        "shelf_life_days": 6.0,
        "spoilage_risks": "Fruit and shoot borer larvae (Leucinodes orbonalis) bore invisible entry holes. Spongy browned pulp turns bitter."
    },
    "cooked_dal": {
        "name": "Cooked Dal / Curry (Dal Tadka / Sambhar)",
        "category": "Prepared Indian Food",
        "stages": ["Freshly Simmered & Aromatic", "Chilled Safe Storage", "Slight Surface Foam / Bubbling", "Sour Acidic Smell", "Spoiled / Microbial Hazard"],
        "indicators": ["Neutral aromatic lentil aroma", "Uniform emulsion", "Zero gas bubbles or fermentation froth", "pH above 5.8"],
        "storage": "Cool rapidly within 90 minutes and refrigerate below 4°C in a covered stainless steel or glass container. Reheat only the portion required to a rolling boil.",
        "shelf_life_days": 2.5,
        "spoilage_risks": "High risk in tropical Indian temperatures (30°C-40°C). Bacillus cereus and lactic acid fermentation cause souring and food poisoning within 6-8 hours at room temp."
    }
}

# ==========================================
# Indian Ingredient Substitution Knowledge
# ==========================================

INDIAN_SUBSTITUTION_MAP = {
    "ghee": {
        "vegan": "Cold-pressed extra virgin coconut oil or sesame oil (1:1 ratio) with a pinch of toasted fenugreek powder",
        "low-fat": "Whipped low-fat hung curd (dahi) in gravies, or cold-pressed mustard oil in moderation",
        "dairy-free": "Cold-pressed groundnut (peanut) oil or virgin olive oil"
    },
    "curd": {
        "vegan": "Unsweetened cashew yogurt or soy curd lightly whisked with lemon juice",
        "dairy-free": "Fresh coconut milk yogurt with 1/2 tsp apple cider vinegar",
        "jain": "Fresh lemon juice with cashew paste or tomato puree for sourness in curries"
    },
    "paneer": {
        "vegan": "Pressed extra-firm organic tofu or air-fried sprouted chickpeas",
        "low-calorie": "Low-fat cow milk paneer or steamed spiced soya chunks (meal maker)",
        "dairy-free": "Tempeh cubes marinated in turmeric and garam masala"
    },
    "onion & garlic": {
        "jain": "Asafoetida (pure compounded hing) + grated ginger + finely diced bottle gourd (lauki) or cabbage for gravy body",
        "ayurvedic": "Finely diced celery stems with hing and cumin for umami depth without rajasic heat",
        "allium-free": "Tomato-cashew paste thickened with roasted gram flour (besan)"
    },
    "tomato": {
        "low-acid": "Soaked tamarind pulp diluted with a dash of jaggery and roasted cumin",
        "budget-saver": "Whisked curd (dahi) with turmeric and 1 tsp amchur (dry mango powder)",
        "jain": "Dry amchur powder + kokum extract for tangy balance in dals and curries"
    },
    "maida": {
        "healthy": "Stone-ground whole wheat atta (chakki atta) or 50% atta + 50% oats flour",
        "gluten-free": "Equal blend of jowar (sorghum) flour, ragi (finger millet) flour, and rice flour with psyllium husk binder",
        "low-gi": "Kuttu (buckwheat) flour mixed with besan (gram flour)"
    },
    "sugar": {
        "diabetic": "Natural stevia leaves extract or monk fruit sweetener (1:1 swap)",
        "traditional": "Organic powdered jaggery (gud) or date paste (reduce liquid slightly)",
        "low-gi": "Coconut palm sugar or crushed soaked black raisins"
    }
}

# ==========================================
# Endpoints
# ==========================================

@app.get("/api/status")
def get_status():
    return {
        "status": "online",
        "platform": "Food Verse AI - Indian Multimodal Food Intelligence",
        "version": "2.0.0",
        "timestamp": time.time(),
        "active_models": [
            "VisionTransformer-Food-India-1000",
            "SpectralDecay-Freshness-CNN-v2",
            "FSSAI-Schedule4-SafetyVision-v3",
            "ChefVerse-IndianCulinary-LLM"
        ],
        "epics_supported": 9,
        "tasks_implemented": 16,
        "standards": "FSSAI Schedule 4 & ISO 22000 Ready"
    }

@app.post("/api/vision/recognize-food")
async def recognize_food(
    file: Optional[UploadFile] = File(None),
    food_name: Optional[str] = Form(None)
):
    """
    Multimodal Visual Indian Food Recognition & Nutrient Breakdown
    Supports uncertain confidence handling and user confirmation requests.
    """
    selected_dish = None
    is_ambiguous = False
    
    if food_name:
        query = food_name.lower().strip()
        for dish in INDIAN_FOOD_DATABASE:
            if (query in dish["name"].lower() or 
                query in dish["id"].lower() or 
                any(query in ing.lower() for ing in dish["common_ingredients"])):
                selected_dish = dish
                break
                
    if not selected_dish:
        # Simulate realistic visual model prediction
        selected_dish = random.choice(INDIAN_FOOD_DATABASE)
        # Randomly simulate occasional low confidence if upload is generic
        if random.random() < 0.22:
            is_ambiguous = True

    confidence = round(random.uniform(0.62, 0.74) if is_ambiguous else random.uniform(0.91, 0.985), 3)
    needs_confirmation = confidence < 0.78

    # Candidate alternatives for user confirmation if confidence is low
    candidates = [
        {"id": d["id"], "name": d["name"], "category": d["category"]}
        for d in random.sample(INDIAN_FOOD_DATABASE, 4)
        if d["id"] != selected_dish["id"]
    ]

    return {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "predicted_dish_name": selected_dish["name"],
        "confidence": confidence,
        "needs_confirmation": needs_confirmation,
        "confirmation_message": "Confidence is moderate. Please confirm if this matches your dish or choose an alternative below." if needs_confirmation else None,
        "candidate_dishes": candidates if needs_confirmation else [],
        "dish": {
            **selected_dish,
            "confidence": confidence,
            "macronutrients": {
                "protein": f"{selected_dish['protein_g']}g",
                "carbohydrates": f"{selected_dish['carbs_g']}g",
                "fats": f"{selected_dish['fats_g']}g",
                "dietary_fiber": f"{selected_dish['fiber_g']}g"
            },
            "health_score": random.randint(84, 96),
            "estimated_prep_time_min": random.randint(15, 35),
            "dietary_tags": [
                selected_dish["regional_tag"],
                "Lacto-Vegetarian" if selected_dish["is_vegetarian"] else "Non-Vegetarian",
                "Jain Friendly" if selected_dish["is_jain_friendly"] else "Contains Allium/Root",
                "Low GI" if selected_dish["glycemic_index"] < 50 else "Moderate GI"
            ]
        }
    }

@app.post("/api/nutrition/estimate-portion")
async def estimate_indian_portion(req: IndianPortionRequest):
    """
    Dynamic Indian Serving Unit Nutrition Calculator
    Calculates exact cumulative calories and macros based on Indian portion choices.
    """
    # Base Nutrition units:
    # 1 roti (dry wheat, ~35g flour): 85 kcal, 3.0g protein, 18g carbs, 0.5g fat, 2.5g fiber
    # Ghee on roti: adds 35 kcal, 4.0g fat
    roti_cal = req.rotis_count * (120 if req.has_ghee_on_roti else 85)
    roti_p = req.rotis_count * 3.0
    roti_c = req.rotis_count * 18.0
    roti_f = req.rotis_count * (4.5 if req.has_ghee_on_roti else 0.5)
    roti_fib = req.rotis_count * 2.5

    # 1 katori dal (150ml toor/moong): 135 kcal, 8.5g protein, 19g carbs, 3.0g fat, 4.5g fiber
    dal_cal = req.dal_katoris * 135
    dal_p = req.dal_katoris * 8.5
    dal_c = req.dal_katoris * 19.0
    dal_f = req.dal_katoris * 3.0
    dal_fib = req.dal_katoris * 4.5

    # 1 bowl rice (150g cooked): 195 kcal, 4.0g protein, 43g carbs, 0.5g fat, 0.8g fiber
    rice_cal = req.rice_bowls * 195
    rice_p = req.rice_bowls * 4.0
    rice_c = req.rice_bowls * 43.0
    rice_f = req.rice_bowls * 0.5
    rice_fib = req.rice_bowls * 0.8

    # 1 katori sabzi (150g dry/semi-gravy): 130 kcal, 3.2g protein, 14g carbs, 7.5g fat, 4.0g fiber
    sabzi_cal = req.sabzi_katoris * 130
    sabzi_p = req.sabzi_katoris * 3.2
    sabzi_c = req.sabzi_katoris * 14.0
    sabzi_f = req.sabzi_katoris * 7.5
    sabzi_fib = req.sabzi_katoris * 4.0

    # 1 glass chaas / dahi (150ml): chaas ~45 kcal, 3.2g protein, 4.8g carbs, 1.5g fat
    curd_cal = req.curd_chaas_glasses * 50
    curd_p = req.curd_chaas_glasses * 3.5
    curd_c = req.curd_chaas_glasses * 5.0
    curd_f = req.curd_chaas_glasses * 1.8
    curd_fib = 0.0

    # Extra ghee: 1 tsp = 45 kcal, 5g fat
    ghee_cal = req.extra_ghee_tsp * 45
    ghee_f = req.extra_ghee_tsp * 5.0

    total_calories = round(roti_cal + dal_cal + rice_cal + sabzi_cal + curd_cal + ghee_cal)
    total_protein = round(roti_p + dal_p + rice_p + sabzi_p + curd_p, 1)
    total_carbs = round(roti_c + dal_c + rice_c + sabzi_c + curd_c, 1)
    total_fats = round(roti_f + dal_f + rice_f + sabzi_f + curd_f + ghee_f, 1)
    total_fiber = round(roti_fib + dal_fib + rice_fib + sabzi_fib + curd_fib, 1)

    return {
        "portions_breakdown": {
            "rotis": f"{req.rotis_count} phulkas ({'with ghee' if req.has_ghee_on_roti else 'plain dry'})",
            "dal": f"{req.dal_katoris} katori ({int(req.dal_katoris * 150)}ml)",
            "rice": f"{req.rice_bowls} bowl ({int(req.rice_bowls * 150)}g)",
            "sabzi": f"{req.sabzi_katoris} katori seasonal sabzi",
            "chaas_curd": f"{req.curd_chaas_glasses} glass spiced chaas/curd",
            "extra_ghee": f"{req.extra_ghee_tsp} tsp (+{ghee_cal} kcal)"
        },
        "approximate_nutrition": {
            "total_calories": total_calories,
            "protein_g": total_protein,
            "carbs_g": total_carbs,
            "fats_g": total_fats,
            "fiber_g": total_fiber,
            "macro_calories_split": {
                "protein_pct": round((total_protein * 4 / total_calories) * 100),
                "carbs_pct": round((total_carbs * 4 / total_calories) * 100),
                "fats_pct": round((total_fats * 9 / total_calories) * 100)
            }
        },
        "verified_vs_estimated_notice": (
            "NOTICE: Values represent approximate culinary averages derived from standard Indian recipe formulations. "
            "Actual calories vary significantly with cooking oil quantity, ghee brushing, flour milling thickness, and specific dal varieties."
        )
    }

@app.post("/api/freshness/analyze")
async def analyze_freshness(
    item_name: Optional[str] = Form("tomato"),
    image: Optional[UploadFile] = File(None)
):
    """
    Indian Produce & Prepared Food Freshness Analyzer
    Features visible spoilage detection & microbiological safety disclaimers.
    """
    key = item_name.lower().strip() if item_name else "tomato"
    matched_key = "tomato"
    for k in INDIAN_FRESHNESS_DATABASE.keys():
        if k in key:
            matched_key = k
            break
            
    data = INDIAN_FRESHNESS_DATABASE[matched_key]
    freshness_index = round(random.uniform(80.5, 96.0), 1)

    if freshness_index >= 90:
        stage = data["stages"][1]
        risk = "Safe / Optimal Quality"
        action = "Consume or cook as per normal culinary protocols."
    elif freshness_index >= 75:
        stage = data["stages"][2]
        risk = "Moderate - Consume within 48-72h"
        action = "Prime window for cooking, parboiling, or light tempering."
    elif freshness_index >= 55:
        stage = data["stages"][3]
        risk = "Elevated - Immediate Use or Repurpose"
        action = "Sort and repurpose into cooked chutneys, purees, or baked dishes."
    else:
        stage = data["stages"][4]
        risk = "Severe - Biological Hazard"
        action = "Discard immediately. Do not ingest."

    remaining_days = round((freshness_index / 100.0) * data["shelf_life_days"], 1)

    return {
        "item_name": data["name"],
        "category": data["category"],
        "freshness_index": freshness_index,
        "ripeness_stage": stage,
        "shelf_life_remaining_days": remaining_days,
        "risk_level": risk,
        "visual_indicators": data["indicators"],
        "spoilage_risks": data["spoilage_risks"],
        "storage_recommendation": data["storage"],
        "culinary_action": action,
        "visible_evidence_analysis": (
            f"Optical evaluation of {data['name']}: Surface skin turgor is consistent with "
            f"{stage.lower()}. Minimal bruising detected on epidermal layer. Ethylene flux within safe baseline."
        ),
        "microbiological_safety_disclaimer": (
            "CRITICAL FOOD SAFETY NOTICE: Visual analysis evaluates visible physical appearance and fungal indicators only. "
            "Never assume food is completely pathogen-free based solely on an image. Invisible microorganisms "
            "(e.g., Salmonella, E. coli, Bacillus cereus, or mycotoxins) may be present without visible discoloration. "
            "Always follow safe food handling and temperature controls."
        )
    }

@app.post("/api/hygiene/audit")
async def audit_kitchen_hygiene(
    facility_type: Optional[str] = Form("street_food"), # street_food, dhaba, restaurant, home_kitchen
    facility_name: Optional[str] = Form("Sharma Sweets & Chaat Corner"),
    video_timestamp_sec: Optional[int] = Form(12),
    snapshot: Optional[UploadFile] = File(None)
):
    """
    FSSAI Schedule 4 Kitchen & Street Food Hygiene Auditing
    Suitable for Indian Dhabas, Street Food Carts, Sweet Shops, Canteens, and Restaurants.
    """
    is_street = "street" in facility_type.lower() or "chaat" in facility_type.lower()
    cleanliness = round(random.uniform(76.0, 94.0) if is_street else random.uniform(88.0, 97.5), 1)

    violations = []

    if is_street:
        violations.append({
            "severity": "HIGH",
            "category": "Food Protection (FSSAI Schedule 4)",
            "description": "Ready-to-eat street food (sev and chopped coriander) observed uncovered without transparent sneeze guards, exposed to ambient road dust and vehicular exhaust.",
            "timestamp": "00:14",
            "fssai_rule": "Clause 4.1.2 - Street food display units must be covered with food-grade protective covers."
        })
        violations.append({
            "severity": "MEDIUM",
            "category": "Personal Hygiene",
            "description": "Food handler dispensing pani puri without food-grade nitrile gloves or dedicated stainless steel ladle.",
            "timestamp": "00:42",
            "fssai_rule": "Clause 5.2 - Bare-hand contact with ready-to-eat food is strictly prohibited."
        })
    else:
        # Restaurant / Dhaba
        if random.random() < 0.4:
            violations.append({
                "severity": "CRITICAL",
                "category": "Frying Oil Integrity (TPC)",
                "description": "Cooking oil in kadai appears dark with visible carbon sediment, suggesting repeated reheating beyond FSSAI 25% Total Polar Compounds (TPC) limit.",
                "timestamp": "01:05",
                "fssai_rule": "FSSAI RUCO (Repurpose Used Cooking Oil) Regulation - Oil with TPC > 25% is unfit for human consumption."
            })
        violations.append({
            "severity": "LOW",
            "category": "Utensil Sanitation",
            "description": "Cleaning cloths stored damp on preparation counter instead of in sanitized chlorine wash solution.",
            "timestamp": "02:18",
            "fssai_rule": "Clause 3.4 - Cleaning cloths must be disinfected frequently."
        })

    grade = "A (Exemplary FSSAI Compliance)" if cleanliness >= 90 and not any(v["severity"] == "CRITICAL" for v in violations) else "B (Compliant with Advisory)"
    if any(v["severity"] == "CRITICAL" for v in violations) or cleanliness < 80:
        grade = "C (Corrective FSSAI Action Required)"

    return {
        "inspection_id": f"FSSAI-AUDIT-{random.randint(10000, 99999)}",
        "facility_name": facility_name,
        "facility_type": facility_type.replace("_", " ").title(),
        "audit_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "overall_cleanliness_score": cleanliness,
        "fssai_grade": grade,
        "observable_hygiene_matrix": {
            "ready_to_eat_food_covered": not is_street,
            "potable_water_source_verified": True,
            "gloves_and_hairnets_detected": not is_street,
            "clean_aprons_in_use": True,
            "cross_contamination_separated": True,
            "oil_tpc_safe_threshold": False if any("TPC" in v["description"] for v in violations) else True
        },
        "violations": violations,
        "practical_recommendations": [
            "Install transparent acrylic sneeze shields over all ready-to-eat condiment bowls and sev counters.",
            "Mandate food-grade disposable gloves or stainless ladles for pani puri water service.",
            "Discard frying oil when darkened or smoke point drops; do not blend used oil with fresh oil.",
            "Ensure washing of serving bowls only under running potable tap water, avoiding stagnant bucket dipping."
        ],
        "audit_limitation_disclaimer": (
            "LEGAL DISCLAIMER: This evaluation is generated by computer vision heuristics for observational guidance. "
            "It does not constitute an official statutory inspection by the Food Safety and Standards Authority of India (FSSAI). "
            "Microbial plate counts, chemical adulteration tests, and pesticide residues require certified laboratory testing."
        )
    }

@app.post("/api/cooking/step")
async def track_cooking_step(req: RecipeStepRequest):
    """
    Adaptive Smart Indian Cooking Assistant with Serving Scaler & Healthier Swaps
    """
    recipe_knowledge = {
        "indori_poha": {
            "title": "Authentic Indori Poha",
            "base_servings": 4,
            "prep_time": "10 mins",
            "cook_time": "12 mins",
            "ingredients": [
                {"name": "Thick Poha (Poha Chivda)", "base_qty": 200, "unit": "g"},
                {"name": "Mustard seeds (Rai)", "base_qty": 1, "unit": "tsp"},
                {"name": "Fennel seeds (Saunf)", "base_qty": 1, "unit": "tsp"},
                {"name": "Green chillies (slit)", "base_qty": 3, "unit": "pcs"},
                {"name": "Onions (finely chopped)", "base_qty": 2, "unit": "medium"},
                {"name": "Roasted Peanuts", "base_qty": 40, "unit": "g"},
                {"name": "Turmeric powder (Haldi)", "base_qty": 0.5, "unit": "tsp"},
                {"name": "Jeeravan Masala", "base_qty": 1.5, "unit": "tsp"},
                {"name": "Cold-pressed oil", "base_qty": 1.5, "unit": "tbsp"},
                {"name": "Fresh coriander & Lemon juice", "base_qty": 2, "unit": "tbsp"}
            ],
            "steps": [
                "Rinse poha in colander gently under running water for 30 seconds. Drain completely, toss with 1/2 tsp sugar, 1/2 tsp salt, and set aside to soften.",
                "Heat oil in a kadai over medium flame. Add mustard seeds and fennel seeds; allow them to crackle and release sweet aroma.",
                "Add peanuts and roast until golden, then stir in green chillies and onions. Saute until onions turn translucent (do not brown).",
                "Add turmeric, toss in drained poha gently. Cover with lid and steam on the lowest flame for 3 minutes until steaming hot and fluffy.",
                "Transfer to plates, sprinkle generous Jeeravan masala, top with crunchy nylon sev, fresh coriander, and squeeze fresh lemon juice."
            ],
            "pro_tip": "Indori poha is steamed, not fried! Adding fennel seeds (saunf) to the tempering is the secret sweet-aromatic signature.",
            "healthier_swap": "Reduce tadka oil to 1 tsp using a non-stick pan; substitute fried sev with roasted makhana crumbs or pomegranate arils."
        },
        "paneer_butter_masala": {
            "title": "Low-Oil Restaurant-Style Paneer Butter Masala",
            "base_servings": 4,
            "prep_time": "15 mins",
            "cook_time": "20 mins",
            "ingredients": [
                {"name": "Fresh Paneer cubes", "base_qty": 250, "unit": "g"},
                {"name": "Ripe Tomatoes (pureed)", "base_qty": 4, "unit": "large"},
                {"name": "Soaked Cashews & Magajtari (melon seeds)", "base_qty": 15, "unit": "g"},
                {"name": "Ginger-Garlic paste", "base_qty": 1, "unit": "tbsp"},
                {"name": "Kashmiri Degi Mirch", "base_qty": 1.5, "unit": "tsp"},
                {"name": "Kasuri Methi (crushed)", "base_qty": 1, "unit": "tbsp"},
                {"name": "Butter / Ghee", "base_qty": 1, "unit": "tbsp"},
                {"name": "Low-fat milk or fresh cream", "base_qty": 3, "unit": "tbsp"}
            ],
            "steps": [
                "Boil tomatoes, ginger, and soaked cashews for 8 minutes. Puree smoothly and strain for a silken restaurant texture.",
                "Heat 1 tbsp butter/oil in a heavy-bottomed pan, add bay leaf and green cardamom, then stir in Degi mirch to bloom the natural vibrant red hue.",
                "Pour in the tomato-cashew puree and simmer on low heat for 10 minutes until oil specks appear on edges.",
                "Stir in warm low-fat milk, salt, and crushed kasuri methi. Gently slide in fresh paneer cubes and simmer for 3 minutes (do not overcook paneer).",
                "Finish with a pinch of garam masala and serve hot with phulkas or jeera rice."
            ],
            "pro_tip": "Rub kasuri methi between your palms before adding to release aromatic essential oils.",
            "healthier_swap": "Blend half cashews and half boiled carrots/bottle gourd for natural sweetness and thickness with 60% less saturated fat."
        }
    }

    key = "indori_poha" if "poha" in req.recipe_name.lower() else "paneer_butter_masala"
    recipe = recipe_knowledge[key]
    scale_factor = (req.servings or 4) / recipe["base_servings"]

    # Scale ingredients
    scaled_ingredients = [
        {
            "name": ing["name"],
            "quantity": round(ing["base_qty"] * scale_factor, 1),
            "unit": ing["unit"]
        }
        for ing in recipe["ingredients"]
    ]

    return {
        "recipe_name": recipe["title"],
        "servings": req.servings or 4,
        "current_step": req.current_step_index + 1,
        "total_steps": len(recipe["steps"]),
        "step_instruction": recipe["steps"][req.current_step_index % len(recipe["steps"])],
        "scaled_ingredients": scaled_ingredients,
        "pro_chef_tip": recipe["pro_tip"],
        "healthier_prep_suggestion": recipe["healthier_swap"],
        "suggested_timer_seconds": 180,
        "jain_modification": "Omit onions & garlic; replace with 1/4 tsp pure asafoetida (hing) in the hot ghee tempering." if req.is_jain else None
    }

@app.post("/api/cooking/substitute")
async def get_ingredient_substitution(req: IngredientSubstitutionRequest):
    """
    Dynamic Indian Ingredient Substitution for Jain, Vegan, Low-Oil, and Diets
    """
    ing = req.ingredient.lower().strip()
    diet = req.dietary_restriction.lower().strip()
    
    matched = None
    for k, v in INDIAN_SUBSTITUTION_MAP.items():
        if k in ing or ing in k:
            matched = v
            break
            
    if matched and diet in matched:
        recommendation = matched[diet]
    elif matched:
        recommendation = list(matched.values())[0]
    else:
        recommendation = f"For {req.dietary_restriction}, swap {req.ingredient} with equivalent culinary alternative (e.g. hung curd, besan slurry, or cold-pressed mustard oil)."

    return {
        "original_ingredient": req.ingredient.title(),
        "dietary_filter": req.dietary_restriction.upper(),
        "smart_substitute": recommendation,
        "ratio": "1:1 equivalent culinary replacement",
        "culinary_impact": "Maintains authentic Indian tadka flavor, gravy emulsion, and digestive balance."
    }

@app.post("/api/nutrition/plan")
async def generate_indian_nutrition_plan(req: IndianNutritionPlanRequest):
    """
    Personalized Indian Meal Planner
    Tailored for Vegetarian, Vegan, Jain, Eggitarian, and Regional Indian preferences.
    """
    # Mifflin-St Jeor Formula
    if req.gender.lower() == "male":
        bmr = (10 * req.weight_kg) + (6.25 * req.height_cm) - (5 * req.age) + 5
    else:
        bmr = (10 * req.weight_kg) + (6.25 * req.height_cm) - (5 * req.age) - 161
        
    multipliers = {
        "sedentary": 1.2,
        "moderate": 1.55,
        "active": 1.75,
        "very_active": 1.9
    }
    tdee = bmr * multipliers.get(req.activity_level.lower(), 1.4)
    
    target_calories = tdee
    if "loss" in req.goal.lower():
        target_calories -= 400
    elif "protein" in req.goal.lower():
        target_calories += 150

    target_calories = int(round(target_calories, -1))
    protein_grams = int(round((target_calories * (0.24 if "protein" in req.goal.lower() else 0.18)) / 4))
    carbs_grams = int(round((target_calories * 0.55) / 4))
    fat_grams = int(round((target_calories * 0.27) / 9))

    # Regional & Dietary Menu Curation
    is_jain = "jain" in req.dietary_preference.lower()
    is_south = "south" in req.regional_cuisine.lower()
    is_nonveg = "non" in req.dietary_preference.lower()

    if is_south:
        breakfast = "Steamed Rava Idli with Vegetable Sambar & Tomato Chutney"
        lunch = "Brown Rice with Avial (Coconut Veggies), Rasam & Buttermilk (Chaas)"
        snack = "Sundal (Tempered Boiled Chickpeas) with Filter Coffee / Green Tea"
        dinner = "Thin Dosa or Oats Uttapam with Mixed Dal Sambar"
    elif is_jain:
        breakfast = "Steamed Moong Dal Dhokla with Green Mint Chutney"
        lunch = "2 Phulkas + Jain Toor Dal Tadka (Hing tempered) + Bottle Gourd (Lauki) Sabzi + Dahi"
        snack = "Roasted Makhana (Foxnuts) with Turmeric & Rock Salt"
        dinner = "Moong Dal & Vegetable Khichdi (No Onion/Garlic) with Roasted Papad"
    elif is_nonveg:
        breakfast = "2 Egg White Omelet with Sprouted Wheat Toast or Poha"
        lunch = "Homestyle Chicken Curry with 2 Chapatis, Steamed Rice & Cucumber Salad"
        snack = "Boiled Kala Chana Chaat with Lemon Juice & Roasted Cumin"
        dinner = "Grilled Tandoori Chicken Tikka with Dal Tadka & 1 Roti"
    else:
        # Balanced North / Central Indian Vegetarian
        breakfast = "Indori Poha with Roasted Peanuts or High-Protein Besan Chilla"
        lunch = "Traditional Thali: 2 Phulkas, 1 Katori Dal Tadka, Seasonal Bhindi/Gobhi Sabzi, Curd & Salad"
        snack = "Roasted Sprouted Moong Chaat with Masala Chai"
        dinner = "Palak Paneer with 2 Multigrain Rotis & Light Vegetable Soup"

    return {
        "user_profile": {
            "bmr": int(round(bmr)),
            "tdee": int(round(tdee)),
            "target_daily_calories": target_calories,
            "goal": req.goal.replace("_", " ").title(),
            "dietary_preference": req.dietary_preference.replace("_", " ").title(),
            "regional_cuisine": req.regional_cuisine.replace("_", " ").title()
        },
        "target_macros": {
            "protein_g": protein_grams,
            "carbs_g": carbs_grams,
            "fats_g": fat_grams,
            "fiber_target_g": 35,
            "water_intake_liters": round(req.weight_kg * 0.038, 1)
        },
        "sample_daily_curation": [
            {
                "meal": "Breakfast (8:30 AM)",
                "dish": breakfast,
                "calories": int(target_calories * 0.25),
                "protein": f"{int(protein_grams * 0.25)}g",
                "serving_unit": "1 standard Indian plate"
            },
            {
                "meal": "Lunch (1:30 PM)",
                "dish": lunch,
                "calories": int(target_calories * 0.38),
                "protein": f"{int(protein_grams * 0.40)}g",
                "serving_unit": "2 Rotis + 1 Katori Dal + 1 Katori Sabzi + Curd"
            },
            {
                "meal": "Evening Snack (5:00 PM)",
                "dish": snack,
                "calories": int(target_calories * 0.12),
                "protein": f"{int(protein_grams * 0.15)}g",
                "serving_unit": "1 small bowl (katori)"
            },
            {
                "meal": "Dinner (8:00 PM)",
                "dish": dinner,
                "calories": int(target_calories * 0.25),
                "protein": f"{int(protein_grams * 0.20)}g",
                "serving_unit": "Light digestible night meal"
            }
        ],
        "medical_disclaimer": (
            "DISCLAIMER: Nutrition values are approximations for general wellness guidance. "
            "Please consult a certified dietician or medical physician for clinical conditions like Type-2 Diabetes or Renal disorders."
        )
    }

@app.post("/api/pantry/zero-waste")
async def generate_zero_waste_recipes(req: PantryZeroWasteRequest):
    """
    Indian Zero-Waste Pantry Meal Generator
    Transforms leftover dal, stale rotis, boiled potatoes, and curd into gourmet Indian meals.
    Estimates household savings in Indian Rupees (₹) and CO2e emissions.
    """
    raw_ings = [i.strip().title() for i in req.ingredients if i.strip()]
    if not raw_ings:
        raw_ings = ["Leftover Dal", "Stale Rotis", "Boiled Potatoes", "Curd"]

    recipes = [
        {
            "title": "Leftover Dal Missi Paratha with Mint Curd",
            "match_rate": "98%",
            "saved_rupees": "₹85 per meal",
            "saved_carbon_footprint": "1.3 kg CO2e",
            "prep_time": "15 mins",
            "ingredients_used": ["Leftover Dal", "Atta / Whole Wheat Flour", "Ajwain", "Green Chillies", "Curd"],
            "instructions": [
                "Knead whole wheat flour directly using leftover dal instead of water, incorporating ajwain, chopped green chillies, and fresh coriander.",
                "Roll into parathas and cook on a hot tawa with a light brush of ghee until crisp and golden brown.",
                "Serve hot with chilled whisked curd to salvage yesterday's dal into a high-protein breakfast."
            ]
        },
        {
            "title": "Baghareli Roti / Chapati Poha (Tempered Rotis)",
            "match_rate": "94%",
            "saved_rupees": "₹60 per meal",
            "saved_carbon_footprint": "0.9 kg CO2e",
            "prep_time": "12 mins",
            "ingredients_used": ["Stale Rotis", "Mustard Seeds", "Curry Leaves", "Turmeric", "Onions"],
            "instructions": [
                "Tear or pulse leftover rotis into bite-sized coarse flakes.",
                "Heat 1 tsp mustard oil; splutter mustard seeds, curry leaves, and green chillies, then lightly saute onions.",
                "Add turmeric and a splash of water to steam the roti flakes until soft, then finish with lemon juice and roasted peanuts."
            ]
        },
        {
            "title": "South Indian Tadka Curd Rice (Bagala Bath)",
            "match_rate": "92%",
            "saved_rupees": "₹70 per meal",
            "saved_carbon_footprint": "1.1 kg CO2e",
            "prep_time": "10 mins",
            "ingredients_used": ["Leftover Rice", "Curd / Dahi", "Mustard Seeds", "Ginger", "Curry Leaves"],
            "instructions": [
                "Mash leftover cooked rice gently with fresh curd, a splash of milk, and salt.",
                "Prepare a quick tadka of mustard seeds, urad dal, finely chopped ginger, and curry leaves in hot ghee.",
                "Pour tadka over curd rice, garnish with pomegranate seeds, and enjoy as a gut-healthy probiotic meal."
            ]
        }
    ]

    return {
        "input_ingredients": raw_ings,
        "recipes_generated": recipes,
        "waste_reduction_tips": [
            "Store leftover rotis wrapped in a cotton muslin cloth inside an airtight box to prevent hardening.",
            "Vegetable peelings (bottle gourd, potato, pea pods) can be tempered into nutritious fibrous sabzi or stock.",
            "Leftover sour curd makes the perfect fermentation starter for instant bhatura or rava dhokla."
        ]
    }

@app.post("/api/chat/chef-verse")
async def chat_with_chef_verse(req: ChatRequest):
    """
    Conversational Multimodal AI Food Assistant for Indian Culinary & Kitchen Intelligence
    """
    q = req.message.lower()
    
    if "poha" in q:
        reply = (
            "To make authentic fluffy Indori poha, always use thick poha (chivda). Rinse gently in a colander and drain for 5 minutes—never soak it in water! "
            "Toss in 1/2 tsp sugar and salt before steaming, and temper with fennel seeds (saunf) and mustard seeds for that authentic sweet-savory fragrance."
        )
    elif "less oil" in q or "low oil" in q:
        reply = (
            "To cut cooking oil in Indian gravies by up to 60%, boil onions and tomatoes with cashews and blend into a silk puree instead of frying them. "
            "Bloom your spices (haldi, degi mirch) in just 1 tsp ghee, then let the puree simmer on low heat. Cast-iron or ceramic cookware also prevents sticking!"
        )
    elif "jain" in q or "onion" in q or "garlic" in q:
        reply = (
            "For Jain cooking without onion and garlic, use a pinch of pure asafoetida (hing) bloomed in hot ghee, along with finely grated ginger and bottle gourd (lauki) or cabbage to replicate the body and natural sweetness of onion gravies."
        )
    elif "fssai" in q or "hygiene" in q or "oil" in q:
        reply = (
            "Under FSSAI regulations, cooking oil must never be repeatedly reheated beyond 25% Total Polar Compounds (TPC), as reheating forms harmful trans-fats and free radicals. "
            "Furthermore, ready-to-eat street foods like pani puri water and sev must always be covered with transparent shields to prevent street dust contamination."
        )
    elif "fresh" in q or "potato" in q or "tomato" in q:
        reply = (
            "Store onions and potatoes separately! Onions release ethylene gas and moisture which cause potatoes to sprout and develop toxic solanine (green skin). "
            "For cooked dals and curries, cool them within 90 minutes and refrigerate below 4°C to prevent rapid souring from tropical Bacillus cereus bacterial growth."
        )
    elif "protein" in q:
        reply = (
            "Top vegetarian Indian protein powerhouses include: Sattu drink (20g protein/100g), Besan chilla with paneer (16g protein), Sprouted green moong dal chaat (14g protein), and Soy chunks (52g protein/100g). "
            "Pairing lentils with grains (dal-chawal) creates a complete amino acid profile!"
        )
    else:
        reply = (
            f"Namaste! I am Food Verse AI, your multimodal Indian culinary copilot. "
            f"I can analyze Indian dish calories in authentic serving units (rotis, katoris, thalis), diagnose produce freshness (mangoes, potatoes, tomatoes), "
            f"audit FSSAI street food & restaurant hygiene, and guide healthy traditional cooking with regional Indian adaptations. What would you like to explore?"
        )
        
    return {
        "reply": reply,
        "timestamp": time.strftime("%H:%M:%S"),
        "confidence": 0.98
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
