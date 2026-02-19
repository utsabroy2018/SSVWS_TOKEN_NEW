import React, { useEffect, useState } from "react"
import "../../LoanForm/LoanForm.css"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import axios from "axios"
import { Spin, Select } from "antd"
import { LoadingOutlined } from "@ant-design/icons"

import BtnComp from "../../../Components/BtnComp"
import { Message } from "../../../Components/Message"
import { url } from "../../../Address/BaseUrl"
import { getLocalStoreTokenDts } from "../../../Components/getLocalforageTokenDts"
import { routePaths } from "../../../Assets/Data/Routes"
import { useFormik } from "formik"
import * as Yup from "yup"
import TDInputTemplateBr from "../../../Components/TDInputTemplateBr"
import { useSocket } from "../../../Context/SocketContext"

function ManualDayCloseForm() {
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()

  const userDetails = JSON.parse(localStorage.getItem("user_details"))

  const [loading, setLoading] = useState(false)
  const [branches, setBranches] = useState([])
  const [openDate, setOpenDate] = useState('')
  const [branche_ID, setBranche_ID] = useState([])
  const [masterUserData, setMasterUserData] = useState({
    branch: "",
  })
  const { socket, connectSocket } = useSocket()


  const formik = useFormik({
  initialValues: {
    branch: "",
  },

  validationSchema: Yup.object({
    branch: Yup.string().required("Branch is required"),
  }),

  onSubmit: (values) => {
    console.log(userDetails?.emp_id, openDate?.opened_date, "Form Data:", values?.branch)
    // fetchBranchResponse(values.branch)
	submitOpenDate(values?.branch)
  },
})


	// Add effect to ensure socket connection
	// useEffect(() => {
	// if (!socket && userDetails?.emp_id) {
	// 	console.log("Initializing socket connection...", 'Socket connection status:')
	// 	connectSocket(userDetails.emp_id)
	// }
	// }, [socket, userDetails, connectSocket])

	// // Debug socket status changes
	// useEffect(() => {
	// 	console.log("Socket connection status:", socket ? "Connected" : "Disconnected")
	// }, [socket])


	// useEffect(() => {
	// if (!socket) return

	// const handler = (payload) => {
	// 	console.log("Received:", payload)
	// }

	// socket.on('month_end_process', handler)

	// return () => {
	// 	socket.off('month_end_process', handler)
	// }
	// }, [socket])



  /* ================= FETCH BRANCH LIST ================= */
  const fetchBranches = async () => {
    try {
      setLoading(true)

      const tokenValue = await getLocalStoreTokenDts(navigate)

      const res = await axios.get(`${url}/fetch_all_branch_dt`, {
        headers: {
          Authorization: `${tokenValue?.token}`,
          "Content-Type": "application/json",
        },
      })

      if (res?.data?.suc === 0) {
        navigate(routePaths.LANDING)
        localStorage.clear()
        Message("error", res?.data?.msg)
        return
      }

      const branchList = [
        { branch_name: "All Branch", branch_code: "A" },
        ...res?.data?.msg,
      ]

      setBranches(branchList)
    } catch (err) {
      Message("error", err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ================= FETCH OPEN DATE AFTER BRANCH SELECT ================= */
  const fetchBranchResponse = async (branchCode) => {
	setBranche_ID('')
    try {
      setLoading(true)

      const tokenValue = await getLocalStoreTokenDts(navigate)

      const res = await axios.post(
        `${url}/admin/fetch_open_date`,
        { branch_code: branchCode },
        {
          headers: {
            Authorization: `${tokenValue?.token}`,
            "Content-Type": "application/json",
          },
        }
      )

      if (res?.data?.suc === 0) {
        navigate(routePaths.LANDING)
        localStorage.clear()
        return
      }
	  setOpenDate(res?.data?.msg[0])
      console.log(branchCode, "Branch Response:", res?.data?.msg[0])
    } catch (err) {
      Message("error", "Error while fetching branch data")
    } finally {
      setLoading(false)
    }
  }

    const submitOpenDate = async (branchCode) => {
    try {
      setLoading(true)

	  const cred = {
		closed_by: userDetails?.emp_id,
		branch_dt: [
			{ branch_code: branchCode, opened_date: openDate?.opened_date }
		]
		}

      const tokenValue = await getLocalStoreTokenDts(navigate)

      const res = await axios.post(
        `${url}/admin/manual_day_end`,cred, {
          headers: {
            Authorization: `${tokenValue?.token}`,
            "Content-Type": "application/json",
          },
        }
      )

    //   if (res?.data?.suc === 0) {
    //     navigate(routePaths.LANDING)
    //     localStorage.clear()
    //     return
    //   }
	//   setOpenDate(res?.data?.msg[0])
      console.log(cred, "DDDDDDDDDDDDD", res?.data)
    } catch (err) {
      Message("error", "Error while fetching branch data")
    } finally {
      setLoading(false)
    }
  }

  /* ================= FORM HANDLERS ================= */
//   const handleBranchChange = (value) => {
//     setMasterUserData((prev) => ({
//       ...prev,
//       branch: value,
//     }))

//     fetchBranchResponse(value)
//   }

//   const onSubmit = (e) => {
//     e.preventDefault()
//     console.log(branche_ID, "Form Data:", masterUserData)
//   }

  const onReset = () => {
    // setMasterUserData({ branch: "" })
	formik.setFieldValue("branch", '')
	setOpenDate('')
	console.log("Form Data:", 'values')
  }

  /* ================= EFFECTS ================= */
  useEffect(() => {
    fetchBranches()
  }, [])

  /* ================= JSX ================= */
  return (
    <Spin
      indicator={<LoadingOutlined spin />}
      size="large"
      spinning={loading}
    >
      <form onSubmit={formik.handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-6 sm:gap-6">

          {/* Branch Select */}
          <div className="sm:col-span-2">
            <label className="block mb-2 text-sm font-bold text-slate-800">
              Select Branch
            </label>

            <Select
			showSearch
			placeholder="Select Branch"
			value={formik.values.branch || undefined}
			disabled={Number(userDetails?.brn_code) !== 100}
			onChange={(value) => {
				formik.setFieldValue("branch", value)
				setBranche_ID('')
				fetchBranchResponse(value)
			}}
			
			onBlur={() => formik.setFieldTouched("branch", true)}
			filterOption={(input, option) =>
				(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
			}
			options={branches.map((el) => ({
				label: `${el.branch_name} (${el.branch_code})`,
				value: el.branch_code,
			}))}
			/>

			{/* Validation Error */}
			{formik.touched.branch && formik.errors.branch && (
			<div style={{ color: "red", fontSize: 12 }}>
				{formik.errors.branch}
			</div>
			)}

          </div>
			<div className="sm:col-span-2">
				<TDInputTemplateBr
					placeholder="Open Date..."
					type="text"
					label="Open Date"
					// name="emp_name"
					formControlName={openDate?.opened_date}
					// handleChange={handleChangeForm}
					mode={1}
					disabled
				/>
			</div>


        </div>

        {/* Buttons */}
        <div className="mt-10 flex">
          <BtnComp mode="A" onReset={onReset} />
        </div>
      </form>
    </Spin>
  )
}

export default ManualDayCloseForm
