import React from "react";
import {Route, IndexRoute} from "react-router"
import Home from "../containers/home"
import Item from "../containers/item"
import Itemprint from "../containers/itemprint"
import Order from "../containers/order"
import Fabric from "../containers/fabric"
import Swatchbook from "../containers/swatchbook"
import _Search from "../containers/search"
import Inventory from "../containers/inventory"
import Report from "../containers/report"
//import Dashboard from "../containers/dashboard"
import Collection from "../containers/collection"



import AuthService from "../AuthService";
const Auth = new AuthService(null);

function loggedIn() {
	return Auth.loggedIn()
}

function requireAuth(nextState, replace) {
	if (!loggedIn()) {
    replace({
      pathname: "/"
    });
  }
}
const createRoutes = () => {
  return (
    <Route path="/">
      <IndexRoute component={Home} />
      <Route path={"/search"} component={_Search} />

			<Route path={"/i"} component={Home} />
      <Route path={"/i/:id"} component={Item} />
      <Route path={"/i/print/:id"} component={Itemprint} />
      <Route path={"/o/:id"} component={Order} />
      <Route path={"/o"} component={Home} />
      <Route path={"/f"} component={Home} />
      <Route path={"/f/:id"} component={Fabric} />
      <Route path={"/s/:id"} component={Swatchbook} />
      <Route path={"/inventory"} component={Inventory} onEnter={requireAuth} />
      <Route path={"/reports"} component={Report} />
      <Route path={"/c/:id"} component={Collection} />



      <Route path={"/swatchbooks/swatchbook/:id"} component={Swatchbook} />
      <Route path={"/fabrics/fabric/:id"} component={Fabric} />
    </Route>
  );
};

const Routes = createRoutes()

export default Routes
