import { withUrqlClient } from "next-urql";

import { Navbar } from "../components/Navbar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
	const [{ data, fetching }] = usePostsQuery();

	return (
		<>
			<Navbar />
			<h1>hello world</h1>

			<br />

			{fetching ? (
				<div>loading...</div>
			) : !data ? null : (
				data.posts.map((p) => (
					<div key={p.id}>
						#{p.id}: {p.title}
					</div>
				))
			)}
		</>
	);
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
