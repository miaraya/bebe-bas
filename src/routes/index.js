import React from "react";
import {Route, IndexRoute} from "react-router";
import Home from "../containers/home";
import Item from "../containers/item";
import Order from "../containers/order";
import Fabric from "../containers/fabric";
import Swatchbook from "../containers/swatchbook";

/*
import Fabric from "../containers/fabric";
import Check from "../containers/check";
import Swatchbook from "../containers/swatchbook";
*/

const createRoutes = () => {
  return (
    <Route path="/">
      <IndexRoute component={Home} />
      <Route path={"/i"} component={Home} />
      <Route path={"/i/:id"} component={Item} />
      <Route path={"/o/:id"} component={Order} />
      <Route path={"/o"} component={Home} />
      <Route path={"/f"} component={Home} />
      <Route path={"/f/:id"} component={Fabric} />
      <Route path={"/s/:id"} component={Swatchbook} />
      <Route path={"/s"} component={Home} />
      <Route path={"/swatchbooks/swatchbook/:id"} component={Swatchbook} />
      <Route path={"/fabrics/fabric/:id"} component={Fabric} />
    </Route>
  );
};

const Routes = createRoutes();

export default Routes;
/*
<Route path={"/fabrics/fabric/"} component={Home} />
<Route path={"/fabrics/"} component={Home} />
<Route path={"/fabrics/fabric/:id"} component={Fabric} />
<Route path={"f/:id"} component={Fabric} />
<Route path={"/check"} component={Check} />
<Route path={"/swatchbooks/swatchbook/:id"} component={Swatchbook} />
<Route path={"s/:id"} component={Swatchbook} />

<Route path={"/i/:id"} component={Item} />
*/
