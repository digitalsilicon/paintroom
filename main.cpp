//
//  main.cpp
//  PaintRoom
//
//  Created by Steven Shim on 5/6/17.
//  Copyright © 2017 Steven Shim. All rights reserved.
//

#include <iostream>
using namespace std;

float convertInchesToFeet (float feet, float inches)
{
    float inchesToFeet = inches/12.0;
    float feetConv = feet + inchesToFeet;
    return feetConv;
}

// function to calculate size of room using width x length x height
void RoomSize(float length, float width, float height)
{
    cout << "The size of the room is " << length * width * height << endl;
}

// function to calculate ceiling paint cost with either color paint or white paint
float CeilingPaintCost (string CeilingPaint, float length, float width)
{
    float ceilingcost = 0;
    
    if(CeilingPaint=="white")
    {
        ceilingcost = (length * width) / 250 * 12.50;
    }
    else if(CeilingPaint=="color")
    {
        ceilingcost = (length * width) / 250 * 12.50;
    }
    cout << "The subtotal for the cost of ceiling is " << ceilingcost << endl;
    return ceilingcost;
}

// function to calculate wall paint cost with color paint
float WallPaintCost (float length, float width, float height, float DoorSize, float WindowSize)
{
    float wallpaintcost = 0;
    wallpaintcost = ((((length * 4) * height) - DoorSize - WindowSize) / 250) * 12.50;
    
    cout << "The subtotal for the cost of the walls is " << wallpaintcost << endl;
    return wallpaintcost;
}

// function to calculate cost of window paint with either color paint or white paint
float WindowCost(string WindowPaint, float NumberOfWindows, float WindowSize)
{
    float windowcost = 0;
    if (WindowPaint == "white")
    {
        for (int a = 0; a < NumberOfWindows; a++)
        {
            windowcost = NumberOfWindows * WindowSize / 100 * 6.50;
        }
    }
    else if (WindowPaint == "color")
    {
        for (int a = 0; a < NumberOfWindows; a++)
        {
            windowcost = NumberOfWindows * WindowSize / 100 * 8.50;
        }
    }
    cout << "The subtotal for the cost of windows is " << windowcost << endl;
    return windowcost;
}

// function to calculate cost of door paint trim with either color or white paint
float DoorCost(string DoorTrimPaint, float NumberOfDoors, float DoorSize)
{
    float doorcost = 0;
    if (DoorTrimPaint == "white")
    {
        for (int d = 0; d < NumberOfDoors; d++)
        {
            doorcost = NumberOfDoors * DoorSize / 100 * 6.50;
        }
        cout << "The subtotal for the cost of doors is " << doorcost << endl;
    }
    else if (DoorTrimPaint ==  "color")
    {
        for (int nd = 0; nd < NumberOfDoors; nd++)
        {
            doorcost = NumberOfDoors * DoorSize / 100 * 8.50;
        }
        cout << "The subtotal for the cost of doors is " << doorcost << endl;
    }
    return doorcost;
}


// main function to run program
int main() {

// variables needed to measure size of room, windows, doors, and trim with color/white paint
    float RoomLengthFeet = 0;
    float RoomLengthInches = 0;
    float RoomLengthInFeet = 0;
    float RoomWidthFeet = 0;
    float RoomWidthInches = 0;
    float RoomWidthInFeet = 0;
    float RoomHeightFeet = 0;
    float RoomHeightInches = 0;
    float RoomHeightInFeet = 0;
    
    string CeilingPaint = "white";
    string WindowTrimPaint = "white";
    string DoorTrimPaint = "white";
    
    float NumberOfWindows = 0;
    float WindowSizeInFeet = 0;
    float WindowSizeInInches = 0;
    float WindowSize = 0;
    
    float NumberOfDoors = 0;
    float DoorSizeInFeet = 0;
    float DoorSizeInInches = 0;
    float DoorSize;
    
    string Trim = "white";
    char recalculateRoom = 'y';
    
    float totalCost = 0;
    
    while (recalculateRoom == 'y')
    {
// Ask the user for input for the size of room, Ceiling Paint, Windows and whether they want white or color paint
    cout << "Hello, let's estimate the cost to Paint a Room!\n";
    cout << "Please enter the length of room size in feet and inches\n";
    cin >> RoomLengthFeet;
    cin >> RoomLengthInches;
    cout << "Please enter the width of room size in feet and inches\n";
    cin >> RoomWidthFeet;
    cin >> RoomWidthInches;
    cout << "Please enter the height of room size in feet and inches\n";
    cin >> RoomHeightFeet;
    cin >> RoomHeightInches;
    
    RoomLengthInFeet = convertInchesToFeet(RoomLengthFeet, RoomLengthInches);
    RoomWidthInFeet = convertInchesToFeet(RoomWidthFeet, RoomWidthInches);
    RoomHeightInFeet = convertInchesToFeet(RoomHeightFeet, RoomHeightInches);
        
        
    cout << "What kind of Ceiling Paint do you wish to use (white/color)?\n";
    cin >> CeilingPaint;
        
    cout << "What kind of paint do you want for the windows? (white/color)?\n";
    cin >> WindowTrimPaint;
    
     cout << "What is the size of the window in feet and inches?\n";
    cin >> WindowSizeInFeet;
    cin >> WindowSizeInInches;
    WindowSize = convertInchesToFeet(WindowSizeInFeet, WindowSizeInInches);
    
	cout << "How many windows will there be in the room?\n";
    cin >> NumberOfWindows;
        
       
    cout << "What kind of paint do you want for the doors? (white/color)?\n";
    cin >> DoorTrimPaint;
        
    cout << "What is the size of the doorways in feet and inches?\n";
    cin >> DoorSizeInFeet;
    cin >> DoorSizeInInches;
    DoorSize = convertInchesToFeet(DoorSizeInFeet, DoorSizeInInches);
    cout << "How many doors will there be in the room?\n";
    cin >> NumberOfDoors;
               
        
    cout << "What is the type of trim you want for the doors and windows (white/color)?\n";
    cin >> Trim;
    
    RoomSize(RoomLengthInFeet, RoomWidthInFeet, RoomHeightInFeet);
    totalCost = CeilingPaintCost(CeilingPaint, RoomLengthInFeet, RoomWidthInFeet) + WindowCost(WindowTrimPaint, NumberOfWindows, WindowSize) + WallPaintCost(RoomLengthInFeet, RoomWidthInFeet, RoomHeightInFeet, DoorSize, WindowSize) + DoorCost(DoorTrimPaint, NumberOfDoors, DoorSize);
        cout << "The total cost is " << totalCost << endl;
    
        
        
    cout << "Do you wish to recalculate the room again?\n";
    cin >> recalculateRoom;
    }
    if (recalculateRoom == 'n')
    {
        cout << "Done\n" << endl;
    }
    return 0;
}


