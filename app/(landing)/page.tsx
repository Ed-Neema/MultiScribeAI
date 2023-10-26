import { LandingHero } from "@/components/LandingHero";
import { LandingNavbar } from "@/components/LandingNavBar";


const LandingPage = () => {
    return (
        <div className="h-full ">
            <LandingNavbar />
            <LandingHero />
    
        </div>
    );
}

export default LandingPage;
