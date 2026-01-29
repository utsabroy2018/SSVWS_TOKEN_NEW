import React, { useState } from "react"
import Sidebar from "../../Components/Sidebar"
import Payroll from "../Admin/Payroll/Payroll"
import COTracking from "../Admin/COTracking/COTracking"

function COTrackingBM() {
	const userDetails = JSON.parse(localStorage.getItem("user_details")) || ""

	return (
		<div>
			<Sidebar mode={2} />
			<COTracking branchCode={+userDetails?.brn_code} />
		</div>
	)
}

export default COTrackingBM
