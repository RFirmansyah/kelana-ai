destination         = input("Destination                : ")
country             = input("Country                    : ")
currency            = input("Currency                   : ")
days                = int(input("Days                       : "))
budget              = float(input("Budget               : "))
travel_style        = input("Travel Style               : ")
month_of_travel     = input("Month of Travel            : ")
hotel_cost          = float(input("Hotel Cost               : "))
transportation_cost = float(input("Transportation Cost      : "))

misc_cost = 1000

total_cost = hotel_cost + transportation_cost + misc_cost

print("=========================================================")
print("========================SUMMARY==========================")
print("=========================================================")
print(f"Destination         : {destination}")
print(f"Country             : {country}")
print(f"Currency            : {currency}")
print(f"Days                : {days}")
print(f"Budget              : {budget} {currency}")
print(f"Travel Style        : {travel_style}")
print(f"Month of Travel     : {month_of_travel}")
print("=========================================================")
print(f"Total Cost          : {total_cost} (+ 1000 Misc. Cost)")
if budget < total_cost:
    print("Total Cost melebihi Budget")
else:
    print("Total Cost dibawah Budget")