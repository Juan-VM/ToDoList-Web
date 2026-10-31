using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

public enum Priority
{
    Baja,
    Media,
    Alta
}

public enum Category
{
    Estudio,
    Trabajo,
    Personal,
    Salud,
    Deporte,
    Finanzas
}

public class TaskItem
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    [BsonElement("title")]
    public string Title { get; set; }

    [BsonElement("description")]
    public string Description { get; set; }

    [BsonElement("completed")]
    public bool Completed { get; set; }

    [BsonElement("priority")]
    [BsonRepresentation(BsonType.String)]
    public Priority Priority { get; set; }

    [BsonElement("category")]
    [BsonRepresentation(BsonType.String)]
    public Category Category { get; set; }

    [BsonElement("createdDate")]
    public DateTime CreatedDate { get; set; }

    [BsonElement("dueDate")]
    public DateTime DueDate { get; set; }

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? UserId { get; set; }
}