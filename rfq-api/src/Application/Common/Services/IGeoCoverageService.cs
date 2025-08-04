using DTO.GeoCoverage;

namespace Application.Common.Services;

public interface IGeoCoverageService
{
    GeoCoverageArea CalculateBoundingBox(double centerLatitude, double centerLongitude, double radiusInMiles);
    bool IsPointWithinCoverage(double centerLatitude, double centerLongitude, double radiusInMiles, double targetLatitude, double targetLongitude);
}
