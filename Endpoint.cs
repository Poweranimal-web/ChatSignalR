using Microsoft.AspNetCore.SignalR;
using Azure.AI.TextAnalytics;
using Azure;
using ModelChat;
namespace Endpoints;

static class AiApi
{
    static Uri endpoint = new(Environment.GetEnvironmentVariable("endpoint"));
    static AzureKeyCredential credential = new(Environment.GetEnvironmentVariable("credential"));
    static TextAnalyticsClient client = new(endpoint, credential);
    public async static Task<DocumentSentiment> SentimentAnalyze(string message)
    {

        DetectedLanguage language = (await client.DetectLanguageAsync(message)).Value;
        Response<DocumentSentiment> response = await client.AnalyzeSentimentAsync(message, language.Iso6391Name);
        return response.Value;
    }
}
public class ChatHub : Hub
{
    private readonly ChatDbContext _context;
    public ChatHub(ChatDbContext context)
    {
        _context = context;
    }
    public async Task JoinRoom(string roomName, string name)
    {

        await Groups.AddToGroupAsync(Context.ConnectionId, roomName);
        await Clients.GroupExcept(roomName, Context.ConnectionId).SendAsync("ConnectUser", $"{name} connected to {roomName}");
    }

    public async Task LeaveRoom(string roomName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
    }

    public async Task SendMessageToRoom(string roomName, string user, string message, string id)
    {

        await Clients.Group(roomName).SendAsync("ReceiveMessage", user, message, id);
    }
    public async Task AnalyzeMessage(string roomName, string user, string message, string id)
    {
        DocumentSentiment result = await AiApi.SentimentAnalyze(message);
        await Clients.Group(roomName).SendAsync("ResultAnalyze", id, result.Sentiment.ToString());
        var chatMessage = new ChatMessage
        {
            UserName = user,
            MessageText = message,
            Sentiment = result.Sentiment.ToString(),
            CreatedAt = DateTime.UtcNow,
            RoomName = roomName
            
        };
        _context.ChatMessages.Add(chatMessage);
        await _context.SaveChangesAsync();   
        
    }
}