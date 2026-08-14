from services.trip_service import total_cost, calculate_daily_budget, get_trip_category, get_transportation, get_trip_season

destination         = input("Destination                : ")
country             = input("Country                    : ")
currency            = input("Currency                   : ")
days                = int(input("Days                       : "))
budget              = float(input("Budget                     : "))
travel_style        = input("Travel Style               : ")
month_of_travel     = input("Month of Travel            : ")
hotel_cost          = float(input("Hotel Cost                 : "))
transportation_cost = float(input("Transportation Cost        : "))

#misc_cost = 1000

total_cost =  total_cost(hotel_cost, transportation_cost)#+ misc_cost

print("=========================================================")
print("==================Kelana AI - SUMMARY====================")
print("=========================================================")
print(f"Destination         : {destination}")
print(f"Country             : {country}")
print(f"Currency            : {currency}")
print(f"Days                : {days}")
print(f"Budget              : {budget} {currency}")
print(f"Travel Style        : {travel_style}")
print(f"Month of Travel     : {month_of_travel}")
print("=========================================================")
print(f"Total Cost                    : {total_cost}")

categories = get_trip_category(budget)
print(f"Travel Category               : {categories}")

recommended_transportation = get_transportation(budget)
print(f"Recomended Transportation     : {recommended_transportation}")

daily_budget = calculate_daily_budget(budget, days)
print(f"Travel Category               : {categories}")
print(f"Daily Budget                  : {daily_budget} {currency}/day")

season = get_trip_season(month_of_travel)
print(f"Season                        : {season}")

recommended_place = [
    "Tokyo Tower",
    "Shibuya",
    "Mount Fuji"
]

print("Recommended places            : ")
for place in recommended_place:
    print(f"- {place}")