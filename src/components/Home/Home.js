import { collection, limit, orderBy, query, startAfter } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "../../contexts/AuthContext";
import { useCausesContext } from "../../contexts/CauseContext";
import { db } from "../../firebase";
import { getAll } from "../../services/crudService";
import { BackToTheTopButton } from "../../shared/BackToTheTopButton";
import { Spinner } from "../../shared/Spinner";
import { CardTemplate } from "./CardTemplate";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export const Home = () => {
    const { currentUser } = useAuth();
    const { causes, setCauses } = useCausesContext();
    const [isLoading, setIsLoading] = useState(true);
    const [latestDoc, setLatestDoc] = useState(0);
    const [clickable, setClickable] = useState(true);
    const [visible, setVisible] = useState(true);


    const causesCollectionRef = collection(db, "causes");
    const orderedQuery = query(causesCollectionRef, orderBy("title"), startAfter(latestDoc || 0), limit(3));

    if (currentUser) {
        console.log(currentUser.uid);
    }

    useEffect(() => {
        // const debounceHandleScroll = debounce(loadMoreScrollHandler, 1000); // for infinite scroll
        // window.addEventListener('scroll', debounceHandleScroll);
        try {
            getAll(orderedQuery)
                .then(docs => {
                    let arr = [];

                    docs.forEach((doc) => {
                        let fields = doc.data();

                        arr.push({
                            id: doc.id,
                            fields: fields
                        });
                        console.log(doc.id, " => ", doc.data());
                    });

                    setCauses(arr);
                    setLatestDoc(docs.docs[docs.docs.length - 1]);
                    console.log("LATEST DOC", latestDoc);
                }).then(() => {
                    setIsLoading(false);
                });
        } catch (error) {
            console.log(error);
        }
    }, []);

    const loadMoreClickHandler = async (e) => {
        console.log("load more clicked");

        try {
            getAll(orderedQuery)
                .then(docs => {
                    if (docs.empty) {
                        setClickable(false);
                        return;
                    }
                    let arr = [];

                    docs.forEach((doc) => {
                        let fields = doc.data();

                        arr.push({
                            id: doc.id,
                            fields: fields
                        });
                        console.log(doc.id, " => ", doc.data());
                    });


                    setCauses(oldArr => [
                        ...oldArr,
                        ...arr
                    ]);


                    console.log("LATEST DOC", latestDoc);
                    setLatestDoc(docs.docs[docs.docs.length - 1]);
                }).then(() => {
                    setIsLoading(false);
                });
        } catch (error) {
            console.log(error);
        }
    }


    console.log(causes);

    return (
        <>
            <h1 className="flex justify-center text-center my-7">Home Page</h1>
            <div  className=" flex justify-center my-7 ">
                <div  className="grid py-10 justify-center my-7  -space-x-15 grid-cols-1  sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-14">
                    {isLoading
                        ? (<Spinner />)
                        : causes.length !== 0
                            ? (causes.map(c => <CardTemplate key={c.id} id={c.id} cause={c.fields} />))
                            : (<h3 className="no-articles">No articles yet</h3>)
                    }
                </div>
            </div>
            {visible &&
                <button id="load-more-button" onClick={clickable ? loadMoreClickHandler : () => {
                    toast.warning('No more causes', {
                        position: toast.POSITION.BOTTOM_CENTER
                      });
                    setVisible(false);
                }}>load more</button>
            }
            {/* <BackToTheTopButton /> */}
            
        </>
    );
}