using Application.Common.Services;
using DTO.GeoCoverage;

namespace Infrastructure.Services;

public sealed class GeoCoverageService : IGeoCoverageService
{
    private const double EarthRadiusMiles = 3958.8;

    /// <summary>
    /// Calculates a bounding box around a circular geographic area given a center point and radius in miles.
    /// Returns a <see cref="GeoCoverageArea"/> with the min/max latitudes and longitudes that enclose the area.
    /// Useful for efficient spatial queries in location-based services, GIS, and spatial analysis.
    /// Accounts for Earth's curvature and handles edge cases near poles and date line.
    /// </summary>
    public GeoCoverageArea CalculateBoundingBox(double centerLatitude, double centerLongitude, double radiusInMiles)
    {
        double latRadians = DegreesToRadians(centerLatitude);
        double latDelta = radiusInMiles / EarthRadiusMiles;

        double minLat = centerLatitude - RadiansToDegrees(latDelta);
        double maxLat = centerLatitude + RadiansToDegrees(latDelta);

        // Clamp latitude to valid range
        minLat = Math.Max(minLat, -90.0);
        maxLat = Math.Min(maxLat, 90.0);

        // Handle longitude calculation with edge cases
        double lonDelta;

        // Near poles, longitude delta becomes very large or undefined
        if (Math.Abs(centerLatitude) > 89.0)
        {
            lonDelta = 180.0; // Cover all longitudes near poles
        }
        else
        {
            lonDelta = RadiansToDegrees(radiusInMiles / (EarthRadiusMiles * Math.Cos(latRadians)));
        }

        double minLon = centerLongitude - lonDelta;
        double maxLon = centerLongitude + lonDelta;

        // Handle longitude wrapping around -180/180 boundary
        minLon = NormalizeLongitude(minLon);
        maxLon = NormalizeLongitude(maxLon);

        return new GeoCoverageArea
        {
            MinLatitude = minLat,
            MaxLatitude = maxLat,
            MinLongitude = minLon,
            MaxLongitude = maxLon
        };
    }

    /// <summary>
    /// Determines if a point (latitude, longitude) is within a circular coverage area defined by a center point and radius.
    /// Uses the Haversine formula for accurate distance calculation.
    /// Optionally uses bounding box for fast initial filtering in performance-critical scenarios.
    /// </summary>
    public bool IsPointWithinCoverage(double centerLatitude, double centerLongitude, double radiusInMiles,
        double targetLatitude, double targetLongitude)
    {
        // Optional: Quick bounding box check for performance (can be removed if not needed)
        var box = CalculateBoundingBox(centerLatitude, centerLongitude, radiusInMiles);
        if (!box.Includes(targetLatitude, targetLongitude))
        {
            return false;
        }

        // Precise distance calculation using Haversine formula
        double distance = CalculateHaversineDistance(centerLatitude, centerLongitude, targetLatitude, targetLongitude);
        return distance <= radiusInMiles;
    }

    /// <summary>
    /// Calculates the great-circle distance between two points on Earth using the Haversine formula.
    /// Returns the distance in miles.
    /// </summary>
    private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        double lat1Rad = DegreesToRadians(lat1);
        double lat2Rad = DegreesToRadians(lat2);
        double deltaLatRad = DegreesToRadians(lat2 - lat1);
        double deltaLonRad = DegreesToRadians(lon2 - lon1);

        double a = Math.Sin(deltaLatRad / 2) * Math.Sin(deltaLatRad / 2) +
                   Math.Cos(lat1Rad) * Math.Cos(lat2Rad) *
                   Math.Sin(deltaLonRad / 2) * Math.Sin(deltaLonRad / 2);

        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusMiles * c;
    }

    /// <summary>
    /// Normalizes longitude to the range [-180, 180] degrees.
    /// </summary>
    private static double NormalizeLongitude(double longitude)
    {
        while (longitude > 180.0)
            longitude -= 360.0;
        while (longitude < -180.0)
            longitude += 360.0;
        return longitude;
    }

    /// <summary>
    /// Converts an angle from degrees to radians using the formula: radians = degrees × (π / 180).
    /// </summary>
    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;

    /// <summary>
    /// Converts an angle from radians to degrees using the formula: degrees = radians × (180 / π).
    /// </summary>
    private static double RadiansToDegrees(double radians) => radians * 180.0 / Math.PI;
}