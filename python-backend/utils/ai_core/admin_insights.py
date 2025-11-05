# backend/utils/ai_core/admin_insights.py

"""
Contains the AdminInsights class, which provides "tools" for the AdminAnalyst
to query the 'query_log' collection using MongoDB aggregation pipelines.
"""

from pymongo.collection import Collection
from datetime import datetime, timedelta

class AdminInsights:
    """
    This class contains the "tools" that the AdminAnalyst can call.
    Each tool is a method that runs a specific, safe, read-only
    MongoDB aggregation against the query_log.
    """
    def __init__(self, log_collection: Collection):
        """
        Initializes the insights module with a direct connection
        to the 'query_log' collection.
        
        Args:
            log_collection: A pymongo.collection.Collection instance
                            for the 'query_log'.
        """
        self.logs = log_collection

    def _get_time_filter(self, time_range_days: int = 0) -> dict:
        """Helper to create a $match stage for a given time range."""
        if time_range_days <= 0:
            return {} # No time filter
        
        start_date = datetime.now() - timedelta(days=time_range_days)
        return {"timestamp": {"$gte": start_date}}

    # --- THIS IS THE NEW, CORRECTED FUNCTION ---
    def get_most_frequent_field(self, field_name: str, time_range_days: int = 0) -> dict:
        """
        TOOL: Gets the most frequently queried values for a specific
        parameter extracted by the AI Planner.
        
        Args:
            field_name (str): The parameter to analyze (e.g., "person_name", 
                              "program", "year_level", "department").
            time_range_days (int): Number of past days to analyze (e.g., 0).
                                   Use 0 for all time.
        """
        try:
            # Define paths *without* the array index
            field_no_dollar = f"plan.plan.tool_call.parameters.{field_name}"
            field_path = f"${field_no_dollar}"

            pipeline = [
                {"$match": self._get_time_filter(time_range_days)},
                
                # First, ensure the plan array exists to be unwound
                {"$match": {"plan.plan": {"$exists": True, "$type": "array"}}},

                # Unwind the plan.plan array to check ALL steps
                {"$unwind": "$plan.plan"},

                # Now, match on the unwound step's parameters
                {"$match": {
                    field_no_dollar: {"$exists": True, "$nin": [None, ""]}
                }},

                # Normalize to array (handles strings/arrays uniformly)
                {"$project": {
                    "items_to_count": {
                        "$cond": {
                            "if": {"$isArray": field_path},
                            "then": field_path,
                            "else": [field_path]
                        }
                    }
                }},

                {"$unwind": "$items_to_count"},
                {"$match": {"items_to_count": {"$nin": [None, ""]}}},

                # Be robust to numbers (e.g., year_level) by stringifying before lowercasing
                {"$group": {
                    "_id": {"$toLower": {"$toString": "$items_to_count"}},
                    "count": {"$sum": 1}
                }},

                {"$sort": {"count": -1}},
                {"$limit": 50},
                {"$project": {"value": "$_id", "count": 1, "_id": 0}}
            ]
            
            results = list(self.logs.aggregate(pipeline))
            
            if not results:
                time_desc = f"in the last {time_range_days} days" if time_range_days > 0 else "in total"
                return {"status": "empty", "data": [], "summary": f"No data found for '{field_name}' {time_desc}."}

            return {"status": "success", "data": results}
            
        except Exception as e:
            return {"status": "error", "summary": f"Database error analyzing '{field_name}': {str(e)}"}
    # --- END OF NEW FUNCTION ---

    def get_system_health_stats(self, time_range_days: int = 0) -> dict:
        """
        TOOL: Returns a report on query outcomes (e.g., success, fail)
        and average response time.
        
        Args:
            time_range_days (int): Number of past days to analyze (e.g., 0).
                                   Use 0 for all time.
        """
        try:
            time_filter = self._get_time_filter(time_range_days)
            
            pipeline = [
                {"$match": time_filter},
                # This tool doesn't need to unwind, it's a top-level field
                {"$group": {
                    "_id": "$outcome", # Group by outcome type
                    "count": {"$sum": 1},
                    "avg_response_time": {"$avg": "$execution_time"}
                }},
                {"$sort": {"count": -1}},
                {"$project": {
                    "outcome": "$_id",
                    "count": 1,
                    "avg_response_time_sec": {"$round": ["$avg_response_time", 2]},
                    "_id": 0
                }}
            ]
            results = list(self.logs.aggregate(pipeline))
            
            if not results:
                time_desc = f"in the last {time_range_days} days" if time_range_days > 0 else "in total"
                return {"status": "empty", "data": [], "summary": f"No health stats found {time_desc}."}

            return {"status": "success", "data": results}
        except Exception as e:
            return {"status": "error", "summary": f"Database error analyzing health stats: {str(e)}"}

    # --- THIS IS THE SECOND NEW, CORRECTED FUNCTION ---
    def get_tool_usage_report(self, time_range_days: int = 0) -> dict:
        """
        TOOL: Returns a report on which AI tools are being used most often.
        
        Args:
            time_range_days (int): Number of past days to analyze (e.g., 0).
                                   Use 0 for all time.
        """
        try:
            # Define paths *without* the array index
            field_no_dollar = "plan.plan.tool_call.tool_name"
            field_path = f"${field_no_dollar}"

            pipeline = [
                {"$match": self._get_time_filter(time_range_days)},
                
                # First, ensure the plan array exists to be unwound
                {"$match": {"plan.plan": {"$exists": True, "$type": "array"}}},

                # Unwind the plan.plan array to check ALL steps
                {"$unwind": "$plan.plan"},

                # Now, match on the unwound step's tool_name
                {"$match": {
                    field_no_dollar: {"$exists": True, "$nin": [None, ""]}
                }},

                {"$group": {"_id": field_path, "count": {"$sum": 1}}},
                {"$sort": {"count": -1}},
                {"$project": {"tool_name": "$_id", "count": 1, "_id": 0}}
            ]
            results = list(self.logs.aggregate(pipeline))
            
            if not results:
                time_desc = f"in the last {time_range_days} days" if time_range_days > 0 else "in total"
                return {"status": "empty", "data": [], "summary": f"No tool usage stats found {time_desc}."}

            return {"status": "success", "data": results}
        except Exception as e:
            return {"status": "error", "summary": f"Database error analyzing tool usage: {str(e)}"}
    # --- END OF NEW FUNCTION ---