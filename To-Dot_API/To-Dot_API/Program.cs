using To_Dot_API.Endpoint;
using MongoDB.Driver;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddOpenApi();

var connectionString = "mongodb+srv://UserName:Password@cluster0.fd4u3wk.mongodb.net/";

builder.Services.AddSingleton<IMongoClient>(new MongoClient(connectionString));


var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.MapTasksEndpoint();


app.Run();
