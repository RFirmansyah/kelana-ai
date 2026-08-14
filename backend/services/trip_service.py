def total_cost(ihotel_cost,itransportation_cost):
    return ihotel_cost + itransportation_cost

def calculate_daily_budget(ibudget,idays):
    return ibudget/idays

def get_trip_category(ibudget):
    if ibudget < 1000:
        return "Backpacker"
    elif ibudget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_transportation(ibudget):
    if ibudget < 1000:
        return "Bus"
    elif ibudget <= 3000:
        return "Train"
    else:
        return "Flight"        