interface CardProp {
    title:string,
    result:number,
    image:string,
    unit:string
}

export default function Card({ title, result, image, unit }:CardProp) {
    return (
        <div className="card-container">
            <div className="content">
                <strong>{title}</strong>
                <span>{result} {unit}</span>
            </div>
            <img src={image} alt={title} />
        </div>
    );
}