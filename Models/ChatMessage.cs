using System;
using System.ComponentModel.DataAnnotations;
namespace ModelChat;
public class ChatMessage
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserName { get; set; }

    public string RoomName { get; set; }

    [Required]
    public string MessageText { get; set; }

    public string Sentiment { get; set; }

    public double SentimentScore { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
