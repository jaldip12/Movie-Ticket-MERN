import { ApiError } from "./ApiError.js";
const isAdmin = (req,res,next) => {
    // console.log(req.body);
    
    if(req.user.role === "admin"){
        next();
    }else {
        return res
        .status(403)
        .json(
            new ApiError(
            403,
            "Access denied. Only Admin can access this route.",
            false
            )
        );
    }

};

export { isAdmin };