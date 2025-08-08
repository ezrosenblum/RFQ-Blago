using Application.Common.Extensions;
using Domain.Primitives;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Linq.Expressions;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Infrastructure.Common.Converters;

public class StatusHistoryToDbJsonConverter : ValueConverter<List<StatusHistory>, string>
{
    private static readonly JsonSerializerOptions Settings = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private static readonly Expression<Func<List<StatusHistory>, string>> ConvertToExpr = x => ConvertTo(x);
    private static readonly Expression<Func<string, List<StatusHistory>>> ConvertFromExpr = x => ConvertFrom(x);

    public StatusHistoryToDbJsonConverter()
        : base(ConvertToExpr, ConvertFromExpr)
    {
    }

    private static string ConvertTo(List<StatusHistory> statusHistory) => statusHistory.ToJson(Settings);

    private static List<StatusHistory> ConvertFrom(string json) => json.Deserialize<List<StatusHistory>>()!;
}