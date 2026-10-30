"""
Django REST Framework Serializers for AuraCast API
Defines structured response schemas for locations, current weather, forecasts, and predictions.
"""

from rest_framework import serializers


class LocationSerializer(serializers.Serializer):
    city = serializers.CharField()
    country = serializers.CharField()
    state = serializers.CharField(allow_null=True, required=False)
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    timezone = serializers.CharField(allow_null=True, required=False)


class GeocodingResultSerializer(serializers.Serializer):
    name = serializers.CharField()
    country = serializers.CharField()
    state = serializers.CharField(allow_null=True, required=False)
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()


class WeatherMetricsSerializer(serializers.Serializer):
    temperature = serializers.FloatField()
    feels_like = serializers.FloatField()
    temp_min = serializers.FloatField()
    temp_max = serializers.FloatField()
    humidity = serializers.IntegerField()
    pressure = serializers.FloatField()
    wind_speed = serializers.FloatField()
    wind_direction_deg = serializers.IntegerField()
    wind_direction_compass = serializers.CharField()
    cloudiness = serializers.IntegerField()
    visibility = serializers.FloatField(allow_null=True, required=False)


class CurrentWeatherSerializer(serializers.Serializer):
    condition = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()
    metrics = WeatherMetricsSerializer()
    sunrise = serializers.CharField(allow_null=True, required=False)
    sunset = serializers.CharField(allow_null=True, required=False)
    observed_at = serializers.CharField()
    source = serializers.CharField()


class HourlyForecastItemSerializer(serializers.Serializer):
    time = serializers.CharField()
    datetime_iso = serializers.CharField()
    temperature = serializers.FloatField()
    feels_like = serializers.FloatField(allow_null=True, required=False)
    humidity = serializers.IntegerField()
    precipitation_prob = serializers.FloatField(allow_null=True, required=False)
    condition = serializers.CharField()
    icon = serializers.CharField()


class HistoricalDataPointSerializer(serializers.Serializer):
    time = serializers.CharField()
    temperature = serializers.FloatField()
    humidity = serializers.IntegerField()
    pressure = serializers.FloatField()
    precipitation = serializers.FloatField()
    wind_speed = serializers.FloatField()


class HistoricalDataSummarySerializer(serializers.Serializer):
    days_retrieved = serializers.IntegerField()
    data_points_count = serializers.IntegerField()
    avg_temperature = serializers.FloatField()
    min_temperature = serializers.FloatField()
    max_temperature = serializers.FloatField()
    avg_humidity = serializers.FloatField()
    total_precipitation = serializers.FloatField()
    recent_trend = HistoricalDataPointSerializer(many=True)
    source = serializers.CharField()


class HourlyPredictionItemSerializer(serializers.Serializer):
    time = serializers.CharField()
    datetime_iso = serializers.CharField()
    temperature = serializers.FloatField()
    humidity = serializers.IntegerField()
    rain_probability = serializers.FloatField()
    condition_estimate = serializers.CharField()


class ModelEvaluationMetricsSerializer(serializers.Serializer):
    temperature_mae = serializers.FloatField()
    temperature_rmse = serializers.FloatField()
    humidity_mae = serializers.FloatField()
    humidity_rmse = serializers.FloatField()
    rain_accuracy = serializers.FloatField()
    rain_precision = serializers.FloatField()
    rain_recall = serializers.FloatField()
    rain_f1 = serializers.FloatField()
    train_samples = serializers.IntegerField()
    test_samples = serializers.IntegerField()
    split_method = serializers.CharField()


class PredictionResultSerializer(serializers.Serializer):
    rain_probability_next_24h = serializers.FloatField()
    rain_expected = serializers.BooleanField()
    rain_risk_level = serializers.CharField()
    hourly_predictions = HourlyPredictionItemSerializer(many=True)
    feature_importance = serializers.DictField(
        child=serializers.FloatField(), allow_null=True, required=False
    )
    evaluation = ModelEvaluationMetricsSerializer()
    methodology_note = serializers.CharField()


class CurrentWeatherResponseSerializer(serializers.Serializer):
    status = serializers.CharField(default="success")
    location = LocationSerializer()
    current = CurrentWeatherSerializer()
    hourly_forecast = HourlyForecastItemSerializer(many=True)
    is_fallback = serializers.BooleanField(default=False)
    message = serializers.CharField(allow_null=True, required=False)


class PredictionBundleResponseSerializer(serializers.Serializer):
    status = serializers.CharField(default="success")
    prediction = PredictionResultSerializer()
    historical = HistoricalDataSummarySerializer()


class WeatherBundleResponseSerializer(serializers.Serializer):
    status = serializers.CharField(default="success")
    location = LocationSerializer()
    current = CurrentWeatherSerializer()
    historical = HistoricalDataSummarySerializer()
    prediction = PredictionResultSerializer()
    hourly_forecast = HourlyForecastItemSerializer(many=True)
    is_fallback = serializers.BooleanField(default=False)
    message = serializers.CharField(allow_null=True, required=False)
