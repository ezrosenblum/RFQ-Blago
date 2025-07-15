using DTO.Response;
using System.Text.RegularExpressions;

namespace Application.Common.Helpers
{
    public static class EnumHelper
    {
        public static List<ListItemBaseResponse> ToListItemBaseResponses<TEnum>() where TEnum : Enum
        {
            var enumValues = Enum.GetValues(typeof(TEnum)).Cast<TEnum>();

            return enumValues.Select(e => new ListItemBaseResponse
            {
                Id = (int)Convert.ChangeType(e, typeof(int)),
                Name = ToReadableString(e)
            }).ToList();
        }
        public static string ToReadableString(this Enum value)
        {
            return Regex.Replace(value.ToString(), "(\\B[A-Z])", " $1");
        }
    }
}
