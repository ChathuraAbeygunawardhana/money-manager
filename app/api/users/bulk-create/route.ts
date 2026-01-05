import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";
import { encryptPassword } from "@/lib/crypto";

const FEMALE_NAMES = [
  'Sanduni', 'Nethmi', 'Sachini', 'Dilshara', 'Tharushi', 'Oshani', 'Himasha', 
  'Maleesha', 'Kaveesha', 'Sithara', 'Hasara', 'Dinusha', 'Piyumi', 'Gayasha', 
  'Senali', 'Amasha', 'Nisansala', 'Umasha', 'Thilina', 'Rashmika'
];

const MALE_NAMES = [
  'Nethmina', 'Kavindu', 'Tharindu', 'Sandun', 'Pasindu', 'Hasitha', 'Supun', 
  'Lakshan', 'Sahan', 'Nimesh', 'Dilshan', 'Chamath', 'Isuru', 'Madusha', 
  'Pramod', 'Janith', 'Dilan', 'Sachin', 'Ashen', 'Thisara'
];

const PROFILE_PICTURES = [
  '/home-screen-images/1.png',
  '/home-screen-images/2.png',
  '/home-screen-images/3.png',
  '/home-screen-images/4.png',
  '/home-screen-images/RMJ10.png',
  '/home-screen-images/RMJ11.png',
  '/home-screen-images/RMJ12.png',
  '/home-screen-images/RMJ13.png',
  '/home-screen-images/RMJ19.png',
  '/home-screen-images/RMJ25.png',
  '/home-screen-images/RMJ8.png',
  '/home-screen-images/VJN1.png',
  '/home-screen-images/VJN10.png',
  '/home-screen-images/VJN12.png',
  '/home-screen-images/VJN2.png',
  '/home-screen-images/VJN5.png',
  '/home-screen-images/VJN6.png',
  '/home-screen-images/VJN7.png',
  '/home-screen-images/VJN8.png',
  '/home-screen-images/VJN9.png'
];

const PROFESSIONAL_BIOS = [
  "Lick my secrets; I'll swallow yours whole.", 
  "Thighs parted, craving your command.", 
  "Bite my neck, own my night.", 
  "Wet whispers: come taste the storm.", 
  "Curves begging for your rough hands.", 
  "Ride the edge with me—now.", 
  "Lips hungry, body yours to break.", 
  "Silk skin, savage soul—join in.", 
  "Pulse racing; pin me, please.", 
  "Forbidden fruit, ripe for devouring.", 
  "Moans waiting: unlock with your key.", 
  "Heat rising—dive into my fire.", 
  "Tease my core; I'll explode.", 
  "Naked truth: fuck me fearless.", 
  "Whimpers for your wicked touch.", 
  "Entwine, explode, repeat endlessly.", 
  "Surrender to my sultry snare.", 
  "Thrust deep; I'll pull you under.", 
  "Velvet vice: grip and gasp.", 
  "Dawn's tease—bed's our battlefield."
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateEmail(name: string): string {
  const randomNumbers = generateRandomNumber(100, 999);
  return `${name.toLowerCase()}${randomNumbers}@gmail.com`;
}

function generateRealisticHeight(gender: 'male' | 'female'): number {
  // Heights in cm
  if (gender === 'male') {
    return generateRandomNumber(165, 185); // Male height range
  } else {
    return generateRandomNumber(155, 175); // Female height range
  }
}

function generateRealisticWeight(height: number, gender: 'male' | 'female'): number {
  // Calculate realistic weight based on height and gender
  const heightInM = height / 100;
  let baseBMI: number;
  
  if (gender === 'male') {
    baseBMI = generateRandomNumber(20, 27); // Male BMI range
  } else {
    baseBMI = generateRandomNumber(18, 25); // Female BMI range
  }
  
  return Math.round(baseBMI * heightInM * heightInM);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Only admins can bulk create users" }, { status: 403 });
    }

    const { count, gender } = await request.json();

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: "Count must be between 1 and 100" }, { status: 400 });
    }

    if (!gender || !['male', 'female'].includes(gender)) {
      return NextResponse.json({ error: "Gender must be 'male' or 'female'" }, { status: 400 });
    }

    const nameList = gender === 'female' ? FEMALE_NAMES : MALE_NAMES;
    const createdUsers = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
      try {
        const name = getRandomElement(nameList);
        const email = generateEmail(name);
        const age = generateRandomNumber(18, 35);
        const bio = getRandomElement(PROFESSIONAL_BIOS);
        const profilePicture = gender === 'female' ? getRandomElement(PROFILE_PICTURES) : null;
        const password = "password123"; // Default password
        
        // Only assign height and weight for male users
        const height = gender === 'male' ? generateRealisticHeight(gender) : null;
        const weight = gender === 'male' && height ? generateRealisticWeight(height, gender) : null;
        
        // Check if user already exists
        const existing = await db.execute({
          sql: "SELECT id FROM users WHERE email = ?",
          args: [email],
        });

        if (existing.rows.length > 0) {
          // Generate a new email with different numbers if collision occurs
          const newEmail = generateEmail(name + generateRandomNumber(1000, 9999));
          const recheck = await db.execute({
            sql: "SELECT id FROM users WHERE email = ?",
            args: [newEmail],
          });
          
          if (recheck.rows.length > 0) {
            errors.push(`Skipped user ${name} - email collision`);
            continue;
          }
          
          // Use the new email
          const userId = randomUUID();
          const encryptedPassword = encryptPassword(password);

          await db.execute({
            sql: `INSERT INTO users (id, email, password, name, role, age, gender, height, weight, bio, profile_picture) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [userId, newEmail, encryptedPassword, name, "user", age, gender, height, weight, bio, profilePicture],
          });

          createdUsers.push({
            id: userId,
            email: newEmail,
            name,
            role: "user",
            age,
            gender,
            height,
            weight,
            bio,
            profile_picture: profilePicture
          });
        } else {
          const userId = randomUUID();
          const encryptedPassword = encryptPassword(password);

          await db.execute({
            sql: `INSERT INTO users (id, email, password, name, role, age, gender, height, weight, bio, profile_picture) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [userId, email, encryptedPassword, name, "user", age, gender, height, weight, bio, profilePicture],
          });

          createdUsers.push({
            id: userId,
            email,
            name,
            role: "user",
            age,
            gender,
            height,
            weight,
            bio,
            profile_picture: profilePicture
          });
        }
      } catch (error) {
        console.error(`Error creating user ${i + 1}:`, error);
        errors.push(`Failed to create user ${i + 1}`);
      }
    }

    return NextResponse.json({
      message: `Successfully created ${createdUsers.length} users`,
      created: createdUsers.length,
      errors: errors.length > 0 ? errors : undefined,
      users: createdUsers
    }, { status: 201 });

  } catch (error) {
    console.error("Bulk create users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}