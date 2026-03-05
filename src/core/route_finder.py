import random
from datetime import datetime, time, date, timedelta
from src.algorithms.search_graph import SearchGraph
from src.algorithms.astar import AStar
from src.algorithms.dfs import DFS
from src.algorithms.bfs import BFS
from src.algorithms.gbfs import GBFS
from src.algorithms.ucs import UCS
from src.algorithms.fringe import Fringe
from datetime import datetime, time, date
import pandas as pd
import math
import os

class RouteFinder:
    """
    Class for finding optimal routes between SCATS sites using various search algorithms
    """
    def __init__(self, network):
        """
        Initialize with a SiteNetwork object
        """
        self.network = network
        self.graph = None
        self.model_dataframes = self._load_dataframes()
        self.traffic_volume_lookup = {}  # Store traffic volume lookup
        
    def _load_dataframes(self):
        """
        Load traffic prediction data from CSV files
        """
        model_data = {}
        base_path = "processed_data/complete_csv_oct_nov_2006"
        
        # Load LSTM model data
        lstm_path = os.path.join(base_path, "lstm_model/lstm_model_complete_data.csv")
        if os.path.exists(lstm_path):
            model_data["LSTM"] = pd.read_csv(lstm_path)
            # Set column names if not already set
            if model_data["LSTM"].columns[0] != "Location":
                model_data["LSTM"].columns = ["Location", "Date", "interval_id", "traffic_volume", "data_source"]
            
        # Load GRU model data
        gru_path = os.path.join(base_path, "gru_model/gru_model_complete_data.csv")
        if os.path.exists(gru_path):
            model_data["GRU"] = pd.read_csv(gru_path)
            # Set column names if not already set
            if model_data["GRU"].columns[0] != "Location":
                model_data["GRU"].columns = ["Location", "Date", "interval_id", "traffic_volume", "data_source"]
            
        # Load Bi_LSTM model data
        bi_lstm_path = os.path.join(base_path, "bi_lstm_model/bi_lstm_model_complete_data.csv")
        if os.path.exists(bi_lstm_path):
            model_data["Custom"] = pd.read_csv(bi_lstm_path)
            # Set column names if not already set
            if model_data["Custom"].columns[0] != "Location":
                model_data["Custom"].columns = ["Location", "Date", "interval_id", "traffic_volume", "data_source"]
            
        return model_data
    
    def _get_algorithm(self, name):
        """
        Get the specified search algorithm instance
        """
        if name == "A*":
            return AStar(self.graph)
        elif name == "DFS":
            return DFS(self.graph)
        elif name == "BFS":
            return BFS(self.graph)
        elif name == "GBFS":
            return GBFS(self.graph)
        elif name == "UCS":
            return UCS(self.graph)
        elif name == "Fringe":
            return Fringe(self.graph)
        return None
    
    def _create_search_graph(self, prediction_model="LSTM", datetime_str=None):
        """
        Convert SiteNetwork to SearchGraph format for search algorithms
        """
        try:
            graph = SearchGraph()
            
            # Parse datetime if provided
            date_obj = None
            interval_id = None
            if datetime_str:
                try:
                    dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
                    date_obj = dt.date()
                    # Convert time to interval_id (assuming intervals are in 15-minute increments)
                    hour = dt.hour
                    minute = dt.minute
                    interval_id = (hour * 4) + (minute // 15)
                except ValueError:
                    # If parsing fails, use current date
                    date_obj = datetime.now().date()
                    current_hour = datetime.now().hour
                    current_minute = datetime.now().minute
                    interval_id = (current_hour * 4) + (current_minute // 15)
            else:
                # If no datetime is provided, use current date
                date_obj = datetime.now().date()
                current_hour = datetime.now().hour
                current_minute = datetime.now().minute
                interval_id = (current_hour * 4) + (current_minute // 15)
            
            date_str = date_obj.strftime("%Y-%m-%d")
            
            # Create a traffic volume lookup dictionary
            self.traffic_volume_lookup = {}
            
            # Get the appropriate dataframe based on the prediction model
            df = self.model_dataframes.get(prediction_model)
            if df is not None:
                try:
                    # Filter the dataframe by date and interval_id if available
                    # Use the most recent available date if exact date not found
                    available_dates = df["Date"].unique()
                    if date_str in available_dates:
                        filtered_df = df[df["Date"] == date_str]
                    elif len(available_dates) > 0:
                        # Sort dates and get the closest available date
                        available_dates = sorted(available_dates)
                        # Use the most recent date
                        closest_date = available_dates[-1]
                        filtered_df = df[df["Date"] == closest_date]
                        print(f"Using closest available date: {closest_date}")
                    else:
                        filtered_df = df
                    
                    # Further filter by interval_id if applicable
                    if interval_id is not None and "interval_id" in filtered_df.columns:
                        # Find closest interval_id if exact match not available
                        available_intervals = filtered_df["interval_id"].unique()
                        if len(available_intervals) > 0:
                            closest_interval = min(available_intervals, key=lambda x: abs(int(x) - interval_id))
                            interval_filtered_df = filtered_df[filtered_df["interval_id"] == closest_interval]
                            if not interval_filtered_df.empty:
                                filtered_df = interval_filtered_df
                    
                    # Create traffic volume lookup by location
                    for _, row in filtered_df.iterrows():
                        location = row["Location"]  # Use named column
                        traffic_volume = float(row["traffic_volume"])  # Use named column
                        self.traffic_volume_lookup[location] = traffic_volume
                except Exception as e:
                    print(f"Error processing traffic data: {e}")
            
            # Add all site IDs as nodes with their coordinates
            for site_id, site in self.network.sites_data.items():
                site_id = int(site_id)
                
                graph.node_coordinates[site_id] = (site['latitude'], site['longitude'])

                # Initialize empty adjacency list for each node
                if site_id not in graph.adjacency_list:
                    graph.adjacency_list[site_id] = []
            
            # Add connections as edges with costs
            for conn in self.network.connections:
                from_id = conn['from_id']
                to_id = conn['to_id']
                distance = conn['distance']  # in km
                
                # Get approach location to find traffic volume
                approach_location = conn.get('approach_location', '')
                traffic_volume = self.traffic_volume_lookup.get(approach_location, None)
                
                # Calculate travel time using traffic volume
                travel_time = self._calculate_travel_time(distance, traffic_volume)
                    
                # Add edge to the graph
                if from_id not in graph.adjacency_list:
                    graph.adjacency_list[from_id] = []
                
                graph.adjacency_list[from_id].append((to_id, travel_time))
            
            return graph
        except Exception as e:
            print(f"Error creating search graph: {e}")
            return SearchGraph()  # Return an empty graph if there's an error
        
    def _calculate_travel_time(self, distance, traffic_volume):
        """
        Calculate travel time based on distance and traffic volume
        Uses a quadratic relationship between traffic volume and speed
        """
        # Default values if traffic data is not available
        if traffic_volume is None or traffic_volume <= 0:
            # Use a default medium traffic flow
            traffic_volume = 100
        
        # Parameters for the quadratic equation: speed = ax² + bx + c, where x is traffic volume
        a = -1.4648375  # Coefficient for traffic_volume²
        b = 93.75    # Coefficient for traffic_volume
        c = -traffic_volume
        d = b * b - (4 * a * c)
        speed = (-b - math.sqrt(d)) / (2 * a)  # km/h
        speed = min(speed, 60)  # Cap speed at 60 km/h
        speed = max(speed, 5)  # Minimum speed of 5 km/h

        # Convert to minutes and add 30 seconds for intersection delay
        travel_time = (distance / speed) * 60 + 30 / 60
        return travel_time
    def find_multiple_routes(self, origin_id, destination_id, selected_algorithms=None, prediction_model="LSTM", datetime_str=None):
        """
        Find routes from origin to destination using multiple algorithms
        Returns a list of routes with their details
        """
        # Use all algorithms if none specified
        all_algorithms = ["A*", "DFS", "BFS", "GBFS", "UCS", "Fringe"]
        if selected_algorithms is None or "All" in selected_algorithms:
            selected_algorithms = all_algorithms
        
        # Create the graph once for all algorithms
        self.graph = self._create_search_graph(prediction_model, datetime_str)
        
        routes = []

        # Run each selected algorithm
        for alg_name in selected_algorithms:
            path, total_cost, route_info = self.find_best_route(
                origin_id, destination_id, alg_name, prediction_model, datetime_str
            )

            if path:
                routes.append({
                    'algorithm': alg_name,
                    'path': path,
                    'total_cost': total_cost,
                    'route_info': route_info,
                    'traffic_level': "",  # Will assign later
                    'prediction_model': prediction_model,
                    'datetime': datetime_str
                })
        
        # Sort routes by total cost (travel time)
        routes.sort(key=lambda x: x['total_cost'])
        
        # Assign colors based on relative performance
        route_colors = ["green", "yellow", "orange", "red", "darkred", "black"]
        route_descriptions = [
            "Best route", 
            "Second best", 
            "Third best", 
            "Fourth best", 
            "Fifth best",
            "Sixth best"
        ]
        
        for i, route in enumerate(routes[:]):
            color_index = min(i, len(route_colors)-1)
            route['traffic_level'] = route_colors[color_index]
            route['route_rank'] = route_descriptions[color_index]
        
        # Limit to at most 6 routes
        return routes[:6]

    def find_best_route(self, origin_id, destination_id, algorithm="All", prediction_model="LSTM", datetime_str=None):
        """
        Find the best route using a specific algorithm
        """
        # Set the origin and destination in the graph
        self.graph.origin = origin_id
        self.graph.destinations = {destination_id}
        
        # Get the search algorithm instance
        search_alg = self._get_algorithm(algorithm)
        
        if not search_alg:
            return None, None, None
        
        # Execute search algorithm
        goal, nodes_expanded, path = search_alg.search(origin_id, [destination_id])
        
        # If no path is found, return None
        if not path:
            return None, None, None
        
        # Calculate route information with time progression
        return path, *self._calculate_route_details(path, prediction_model, datetime_str)

    
    def _calculate_route_details(self, path, prediction_model, datetime_str):
        """
        Calculate total travel time and create a list of steps for a path
        Account for time progression when calculating traffic for each segment
        """
        total_cost = 0
        route_info = []
        
        # Initialize current time from datetime_str
        try:
            current_datetime = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            # Fallback to current time if datetime_str is invalid
            current_datetime = datetime.now()
            
        for i in range(len(path) - 1):
            from_id = path[i]
            to_id = path[i + 1]
            
            # Find the connection between these sites
            connection = self._find_connection(from_id, to_id)
            
            if connection:
                # Round current_datetime to nearest 15-minute interval for prediction lookup
                rounded_datetime = self._round_to_15_minutes(current_datetime)
                
                # Get the approach location to find traffic volume
                approach_location = connection.get('approach_location', '')
                
                # Calculate interval_id based on rounded_datetime
                current_interval_id = (rounded_datetime.hour * 4) + (rounded_datetime.minute // 15)
                
                # Get traffic volume for the current time
                traffic_volume = self._get_traffic_volume_for_time(
                    approach_location, 
                    rounded_datetime.date().strftime("%Y-%m-%d"), 
                    current_interval_id,
                    prediction_model
                )
                
                # Calculate travel time - implement fallback if needed
                distance = connection['distance']
                if traffic_volume is None:
                    # Try to reverse-engineer traffic volume based on assumed travel time
                    travel_time = (distance / 45) * 60 + 0.5  # Initial estimate
                    speed = (distance / (travel_time - 0.5)) * 60  # km/h
                    
                    if speed >= 54:  # Almost free flow (90% of free flow speed)
                        traffic_volume = 50
                    elif speed >= 48:  # 80% of free flow
                        traffic_volume = 75
                    elif speed >= 42:  # 70% of free flow
                        traffic_volume = 125
                    elif speed >= 36:  # 60% of free flow
                        traffic_volume = 150
                    elif speed >= 30:  # 50% of free flow
                        traffic_volume = 175
                    elif speed >= 24:  # 40% of free flow
                        traffic_volume = 200
                    elif speed >= 18:  # 30% of free flow
                        traffic_volume = 225
                    elif speed >= 12:  # 20% of free flow
                        traffic_volume = 250
                    else:  # Highly congested
                        traffic_volume = 275
                
                # Calculate travel time with traffic volume
                travel_time = self._calculate_travel_time(distance, traffic_volume)
                
                # Add to total cost
                total_cost += travel_time
                
                # Update current time for next segment
                time_delta = timedelta(minutes=travel_time)
                current_datetime = current_datetime + time_delta
                
                # Add step info
                route_info.append({
                    'from_id': from_id,
                    'to_id': to_id,
                    'road': connection['shared_road'],
                    'distance': connection['distance'],
                    'travel_time': travel_time,
                    'from_lat': connection['from_lat'],
                    'from_lng': connection['from_lng'],
                    'to_lat': connection['to_lat'],
                    'to_lng': connection['to_lng'],
                    'traffic_volume': traffic_volume,
                    'arrival_time': current_datetime.strftime("%H:%M")
                })
        
        return total_cost, route_info

    def _get_traffic_volume_for_time(self, location, date_str, interval_id, prediction_model):
        """
        Get traffic volume for a specific location, date and interval
        """
        # Get the appropriate dataframe based on the prediction model
        df = self.model_dataframes.get(prediction_model)
        if df is not None:
            try:
                # Filter by date
                available_dates = df["Date"].unique()
                if date_str in available_dates:
                    filtered_df = df[df["Date"] == date_str]
                elif len(available_dates) > 0:
                    # Sort dates and get the closest available date
                    available_dates = sorted(available_dates)
                    closest_date = available_dates[-1]
                    filtered_df = df[df["Date"] == closest_date]
                else:
                    filtered_df = df
                
                # Filter by location
                location_filtered = filtered_df[filtered_df["Location"] == location]
                
                if not location_filtered.empty:
                    # Filter by interval_id
                    if "interval_id" in location_filtered.columns:
                        available_intervals = location_filtered["interval_id"].unique()
                        if len(available_intervals) > 0:
                            closest_interval = min(available_intervals, key=lambda x: abs(int(x) - interval_id))
                            final_filtered = location_filtered[location_filtered["interval_id"] == closest_interval]
                            if not final_filtered.empty:
                                return float(final_filtered.iloc[0]["traffic_volume"])
                    
                    # Fallback to any traffic volume for this location
                    return float(location_filtered.iloc[0]["traffic_volume"])
                    
            except Exception as e:
                print(f"Error getting traffic volume for time: {e}")
        
        return None
    
    def _round_to_15_minutes(self, dt):
        """
        Round datetime to the nearest 15-minute interval (going backwards)
        Returns a new datetime object with rounded minutes
        """
        # Extract minutes and round down to nearest 15-minute interval
        total_minutes = dt.hour * 60 + dt.minute
        rounded_minutes = (total_minutes // 15) * 15
        
        # Create new time with rounded minutes
        new_hour = rounded_minutes // 60
        new_minute = rounded_minutes % 60
        
        # Create a new datetime with the rounded time
        return dt.replace(hour=new_hour, minute=new_minute, second=0, microsecond=0)
    
    def _find_connection(self, from_id, to_id):
        """
        Find a connection between two sites
        """
        for conn in self.network.connections:
            if conn['from_id'] == from_id and conn['to_id'] == to_id:
                return conn
        return None 