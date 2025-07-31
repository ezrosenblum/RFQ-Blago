using DTO.Attributes;

namespace DTO.Enums.Company;

public enum CompanySize
{
    [LocalizationKey("enum.company.size.small")]
    Small = 1,
    [LocalizationKey("enum.company.size.medium")]
    Medium,
    [LocalizationKey("enum.company.size.large")]
    Large
}
