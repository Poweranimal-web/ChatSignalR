using System.Text;
using Microsoft.Extensions.FileProviders;
using Endpoints;
using ModelChat;
using Microsoft.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        builder =>
        {
            builder.WithOrigins("https://localhost:5176")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
});
builder.Services.Configure<AzureTextAnalyticsSettings>(
    builder.Configuration.GetSection("AzureTextAnalytics")
);
builder.Services.AddDbContext<ChatDbContext>(options =>
    options.UseSqlServer(Environment.GetEnvironmentVariable("Connection")));

var app = builder.Build();

app.UseStaticFiles();
app.MapGet("/", async (context) => {
    await context.Response.SendFileAsync("static/html/main.html");
});
app.UseCors();
app.MapHub<ChatHub>("/chathub");
app.Run();
