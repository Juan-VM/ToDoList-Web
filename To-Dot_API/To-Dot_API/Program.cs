using To_Dot_API.Endpoint;
using MongoDB.Driver;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddOpenApi();

var connectionString = "mongodb+srv://userName:Psw@cluster0.fd4u3wk.mongodb.net/";
builder.Services.AddSingleton<IMongoClient>(new MongoClient(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularApp", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


var app = builder.Build();

// CORS antes de los endpoints.
app.UseCors("AngularApp");

app.UseHttpsRedirection();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapTasksEndpoint();


app.Run();
