import { asyncHandler } from "../utils/asynchandler.js";
import User from "../models/user.model.js";
import Client from "../models/client.model.js";
import { ApiResponse } from "../utils/apiresponce.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registeruser = asyncHandler(async (req, res) => {
  const { firstname, lastname, email, password, number, gender, role } =
    req.body;

  if (
    (!firstname || !lastname || !email || !password || !number || !gender,
    !role)
  ) {
    return res
      .status(400)
      .json(new ApiResponse(400, "Please fill all the fields", false));
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res
        .status(400)
        .json(new ApiResponse(400, "Email already in use", false));
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newuser = await User.create({
      firstname,
      lastname,
      email,
      password: hashPassword,
      number,
      gender,
      role,
    });

    let user = await newuser.save();

    try {
      if (role == "user") {
        const { city } = req.body;
        if (!city) {
          return res
            .status(400)
            .json(new ApiResponse(400, "Please fill all the fields", false));
        }
        const newclient = await Client.create({
          userId: user._id,
          city,
        });
        let client = await newclient.save();
        user = { ...user.toObject(), ...client.toObject() };
      }
    } catch (error) {
      console.log(error);

      return res.status(500).json(new ApiResponse(500, "Server Error", false));
    }

    delete user.password;
    res
      .status(201)
      .json(new ApiResponse(200, user, "User created successfully"));
  } catch (error) {
    console.log(error);

    return res.status(500).json(new ApiResponse(500, "Server Error", false));
  }
});

const getUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(401, "User not found", false));
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json(new ApiResponse(401, "Invalid Password", false));
    }

    // console.log(user);

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      }
    );
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 259200000,
    };
    res.cookie("token", token, options);

    // Respond with a 200 status and success message
    res.status(200).json(new ApiResponse(200, user.role, true)); // Corrected the response format
  } catch (error) {
    res.status(500).json(new ApiResponse(500, "server error", error.message));
  }
};

const logout = async (req, res) => {
  try {
    // Clear the cookie with matching options as login
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };
    res.clearCookie("token", options);

    res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
  } catch (error) {
    res
      .status(500)
      .json(new ApiResponse(500, "Error during logout", error.message));
  }
};

const pingUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json(new ApiResponse(401, "User not found"));
    }
  

    res.status(200).json(new ApiResponse(200, {user:req.user}, "User Found"));
  } catch (error) {
    console.log(error);
    res.status(500).json(new ApiResponse(500, "Server Error", error.message));
  }
};

export { registeruser, getUser, logout, pingUser };
