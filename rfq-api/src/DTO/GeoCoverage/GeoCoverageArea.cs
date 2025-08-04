namespace DTO.GeoCoverage;

public sealed class GeoCoverageArea
{
    public double MinLatitude { get; init; }
    public double MaxLatitude { get; init; }
    public double MinLongitude { get; init; }
    public double MaxLongitude { get; init; }

    public bool Includes(double latitude, double longitude)
    {
        return latitude >= MinLatitude && latitude <= MaxLatitude &&
               longitude >= MinLongitude && longitude <= MaxLongitude;
    }
}
