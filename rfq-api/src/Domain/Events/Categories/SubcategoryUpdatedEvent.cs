using Domain.Entities.Categories;

namespace Domain.Events.Categories;

public sealed class SubcategoryUpdatedEvent : BaseEvent
{
    public SubcategoryUpdatedEvent(Subcategory subcategory)
    {
        Subcategory = subcategory;
    }

    public Subcategory Subcategory { get; }
}
