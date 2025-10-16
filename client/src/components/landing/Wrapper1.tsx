import Top_left from "./Top_left"
import Top_right from "./Top_right"

const Wrapper1 = () => {
    return (
        <div className="section2 flex flex-col lg:flex-row content-center justify-center items-center lg:gap-10  lg:px-10">
            <Top_left />
            <Top_right />
        </div>
    )
}

export default Wrapper1