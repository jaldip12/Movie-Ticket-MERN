import { ApiError } from "./ApiError.js";

const isAdmin = (req,res,next) => {
    if(req.admin.role === "Admin"){
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