using Microsoft.EntityFrameworkCore;
namespace ModelChat;
public class ChatDbContext : DbContext
{
    public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options) { }

    public DbSet<ChatMessage> ChatMessages { get; set; }
}