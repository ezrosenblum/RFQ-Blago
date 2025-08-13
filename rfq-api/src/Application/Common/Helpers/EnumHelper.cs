using Application.Common.Localization;
using DTO.Response;
using Microsoft.Extensions.DependencyInjection;
using System.Text.RegularExpressions;

namespace Application.Common.Helpers
{
    public static class EnumHelper
    {
        public static List<ListItemBaseResponse> ToListItemBaseResponses<TEnum>(ILocalizationService localizationService) where TEnum : Enum
        {
            var enumValues = Enum.GetValues(typeof(TEnum)).Cast<TEnum>();

            return enumValues.Select(e => new ListItemBaseResponse
            {
                Id = (int)Convert.ChangeType(e, typeof(int)),
                Name = localizationService.GetValue(e)
            }).ToList();
        }

        public static List<ListItemBaseResponse> ToListItemBaseResponsesWithLocalization<TEnum>(IServiceProvider serviceProvider) where TEnum : Enum
        {
            var localizationService = serviceProvider.GetRequiredService<ILocalizationService>();
            return ToListItemBaseResponses<TEnum>(localizationService);
        }

        public static string ToReadableString(this Enum value)
        {
            return Regex.Replace(value.ToString(), "(\\B[A-Z])", " $1");
        }
    }
}
