using Domain.Entities.Categories;

namespace Domain.Events.Categories;

public sealed class SubcategoryCreatedEvent : BaseEvent
{
    public SubcategoryCreatedEvent(Subcategory subcategory)
    {
        Subcategory = subcategory;
    }

    public Subcategory Subcategory { get; }
}
