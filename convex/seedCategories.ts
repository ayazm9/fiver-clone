import { mutation , query } from "./_generated/server";
import { Id } from "./_generated/dataModel"; 

const categories=[
    {name :'Web Development'},
    {name :'Mobile Devlopment'},
    {name :'Design'},
    {name :'Writing'},
    {name :'Marketing'},
    {name :'DataScience'},
    {name :'AI'},
    {name :'Game Devlopment'},
    {name :'Finance'},
    {name :'Photography'},
    
    
];

export const create =mutation({
    handler:async(ctx ,args) =>{
        const identity =await ctx.auth.getUserIdentity();


        if(!identity){
            throw new Error ("Unauthorized");
        }

        categories.map(async (category)=>{
            await ctx.db.insert("categories",{
                name:category.name
            })

        })

        return;
    },
});