using Domain.Entities.Categories;

namespace Domain.Events.Categories;

public sealed class CategoryUpdatedEvent : BaseEvent
{
    public CategoryUpdatedEvent(Category category)
    {
        Category = category;
    }

    public Category Category { get; }
}
